import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';

import * as stream from 'stream';
import { promisify } from 'util';

import axios from 'axios';
import YAML from 'yaml';
import { compare } from 'compare-versions';
import StreamZip from 'node-stream-zip';
import {BaseTreeItem} from './BaseTreeItem';
import {IotDeviceAccount} from './IotDeviceAccount';
import {IotDeviceInformation} from './IotDeviceInformation';
 
import {IotConfiguration } from './IotConfiguration';
import {IotResult,StatusResult } from './IotResult';
import {v4 as uuidv4} from 'uuid';
import {IotItemTree } from './IotItemTree';
import { config } from 'process';
import SSH2Promise from 'ssh2-promise';
import {IotDevice} from './IotDevice';
import {IotLaunchOptions} from './IotLaunchOptions';
import {IotLaunchEnvironment} from './IotLaunchEnvironment';
import {IotLaunchProject} from './IotLaunchProject';
import {IotTemplateAttribute} from './IotTemplateAttribute';
import {IotTemplate} from './IotTemplate';
import {EntityType,GetUniqueLabel,MakeDirSync,MergeWithDictionary,DeleteComments} from './Helper/IoTHelper';

export class IotTemplateCollection {
  public Templates:Map<string,IotTemplate>;
  private _config:IotConfiguration;
  constructor(config:IotConfiguration
    ){
      this.Templates= new Map<string,IotTemplate>();
      this._config=config;
  }
  
  private TemplateCanAddedToCollection(path:string,type:EntityType):IotResult
  {
    let template = new IotTemplate(path,type);
    let result:IotResult;
    if(!template.IsValid)
    {
      let errors:string="";
      template.ValidationErrors.forEach(error =>
        {
          errors=errors + error + '\n ';
        });
      //error
      result = new IotResult(StatusResult.Error,`Template ${path} has not been validated`,errors);
      return result;
    }
    //checking
    if(!this.Templates.has(template.Attributes.Id))
      {
        //add new
        result = new IotResult(StatusResult.Ok,"",undefined);
        result.tag="new";
        result.returnObject=template;
      }else
      {
        //update
        const existingTemplate=this.Templates.get(template.Attributes.Id);
        if(existingTemplate){
          //system type checking
          if (existingTemplate.Type==template.Type){
            //template version comparison
            if(compare(template.Attributes.Version, existingTemplate.Attributes.Version, '>'))
            {
              result = new IotResult(StatusResult.Ok,"",undefined);
              result.tag="update";
              result.returnObject=template;
            }else result = new IotResult(StatusResult.No,undefined,undefined);
          }else result = new IotResult(StatusResult.No,undefined,undefined);
        }else
        {
          result = new IotResult(StatusResult.Ok,"",undefined);
          result.tag="new";
        }
      }
    //end processing
    return result;
  }

  private DeleteTemplateFromDisk(path:string)
  {
    //delete directory recursively
    fs.rmdirSync(path, { recursive: true }); 
  }
  private GetListDirTemplatesFromFolder(path:string,type:EntityType):string[]
  {
    let listFolders:Array<string>=[];
    //getting a list of template directories
    if(type==EntityType.system)
    {
      this.GetListNameBuiltInTemplates().forEach(name => {
        //directory
        const dir=`${path}\\${name}`;
        listFolders.push(dir);
      });
    }else{
      const files = fs.readdirSync(path);
      //getting a list of folders
      files.forEach(name => {
        //directory
        const dir=`${path}\\${name}`;  
        if(fs.lstatSync(dir).isDirectory())
        {
          listFolders.push(dir);
        }
      });
    }
    return listFolders;
  }
  
  private async LoadTemplatesFromFolder(path:string,type:EntityType):Promise<void>
  {
    let result= new IotResult(StatusResult.None,undefined,undefined);
    const listFolders=this.GetListDirTemplatesFromFolder(path,type);
    //ckeck
    if (listFolders.length==0)
    {
      result=new IotResult(StatusResult.Error,`${path} folder is empty`,undefined);
      //return Promise.resolve(result);
    }
    //checking all folders
    listFolders.forEach(dir => {
      let resultCanAddTemplate= this.TemplateCanAddedToCollection(dir,type);
      //Recovery system template
      if(type==EntityType.system&&StatusResult.Error==resultCanAddTemplate.Status)
      {
        this.RecoverySystemTemplate(dir);
        resultCanAddTemplate= this.TemplateCanAddedToCollection(dir,type);
      }
      //
      switch(resultCanAddTemplate.Status) { 
        case StatusResult.Error: {
          result.AppendResult(resultCanAddTemplate);
          break; 
        } 
        case StatusResult.Ok: {
          const template:IotTemplate=resultCanAddTemplate.returnObject;
          if(resultCanAddTemplate.Message=="update")
          {
             //removal previous version
             this.Templates.delete(template.Attributes.Id);
             //remove previous version from disk
             this.DeleteTemplateFromDisk(dir);
          }
          //add template
          this.Templates.set(template.Attributes.Id,template);
          break; 
        }
        case StatusResult.No: { 
          result.AppendResult(resultCanAddTemplate);
          break; 
        } 
        default: { 
           //statements; 
           break; 
        } 
     }
    });
  }

  private GetListNameBuiltInTemplates():string[]
  {
    let listNames:Array<string>=[];
    const dirTemplates=this._config.Folder.Extension+
      "\\templates\\system\\";
    //getting a list of template files
    const files = fs.readdirSync(dirTemplates );
    files.forEach(name => {
      //file
      if(fs.lstatSync(name).isFile())
      {
        const re = /(?:\.([^.]+))?$/;
        const ext = re.exec(name);
        if(ext?.length==2)
        {
          if(ext[1]=="zip")
          {
            const nameTemplate=name.substring(0,name.length-4)
            listNames.push(nameTemplate);
          }
        }
      }
    });
    return listNames;
  }

  private async RecoverySystemTemplate(destPath:string):Promise<void>
  {
    //destination path check
    if (fs.existsSync(destPath)) this.DeleteTemplateFromDisk(destPath);
    //create dir
    MakeDirSync(destPath);
    const sourceTemplateZipPath= this._config.Folder.Extension+
      "\\templates\\system\\"+destPath.substring(destPath.lastIndexOf('/'))+".zip";
    //unpack
    const unpackPath=destPath;
    const zip = new StreamZip.async({ file: sourceTemplateZipPath });
    const count = await zip.extract(null, unpackPath);
    console.log(`Extracted ${count} entries`);
    await zip.close();
  }

  public async LoadTemplatesSystem():Promise<void>
  {
    await this.LoadTemplatesFromFolder(this._config.Folder.TemplatesSystem,EntityType.system);
  }

  public async LoadTemplatesUser():Promise<void>
  {
    await this.LoadTemplatesFromFolder(this._config.Folder.TemplatesUser,EntityType.user);
  }

  public async LoadTemplatesCommunity():Promise<void>
  {
    await this.LoadTemplatesFromFolder(this._config.Folder.TemplatesCommunity,EntityType.community);
  }

  public async GetDownloadListTemplates(url:string):Promise<EntityDownloadTemplate[]>
  {
    let listDownloadTemplates:Array<EntityDownloadTemplate>=[];
    //download templatelist.fastiot.yaml
    const response = await axios.get(url);
    console.log(response.status); //200
    console.log(response.data);
    //parse templatelist.fastiot.yaml
    const obj=YAML.parse(response.data);
    console.log(obj);  
    //template download
    let index=0; 
    do { 				
          let item=obj.templates[index];
          if(item) {
            const itemId=item.id;
            const itemVersion=item.version;
            const itemUrl=url.substring(0,url.lastIndexOf('/'))+"/"+itemId+".zip";
            //const filename = uri.split('/').pop()?.substring(0,uri.split('/').pop()?.lastIndexOf('.'));
            //const fileZipPath=this._config.Folder.Temp+"\\"+filename+".zip";
            console.log(itemUrl);
            const downloadTemplate=new EntityDownloadTemplate(
                itemId,itemVersion,itemUrl);
            listDownloadTemplates.push(downloadTemplate);
            //next position
            index=index+1;
          }else break;
        }  
    while(true)
    //result
    return Promise.resolve(listDownloadTemplates);
  }

  private async DownloadTemplate(item:EntityDownloadTemplate,destPath:string,type:EntityType):Promise<IotResult>
  {
    let result:IotResult;
    //clear
    this._config.Folder.ClearTmp();
    //download *.zip
    const fileZipPath=this._config.Folder.Temp+"\\"+item.Id+".zip";
    await downloadFile(item.Url,fileZipPath);
    //unpack
    let unpackPath=this._config.Folder.Temp+"\\"+item.Id;
    const zip = new StreamZip.async({ file: fileZipPath });
    const count = await zip.extract(null, unpackPath);
    console.log(`Extracted ${count} entries`);
    await zip.close();
    //template can added
    const resultCanAddTemplate= this.TemplateCanAddedToCollection(unpackPath,type);
    //
    result= resultCanAddTemplate;
    switch(resultCanAddTemplate.Status) { 
      case StatusResult.Error: {
        break; 
      } 
      case StatusResult.Ok: {
        let template:IotTemplate=resultCanAddTemplate.returnObject;
        if(resultCanAddTemplate.tag=="update")
        {
           //removal previous version
           this.Templates.delete(template.Attributes.Id);
           //remove previous version from disk
           this.DeleteTemplateFromDisk(template.Path);
        }
        //move
        const srcDir = unpackPath;
		    const destDir = destPath+"\\"+item.Id; //!!!! проверить уязвимость
        fs.moveSync(srcDir,destDir);
        template= new IotTemplate(destDir,type);
        //add template
        this.Templates.set(template.Attributes.Id,template);
        break; 
      }
      case StatusResult.No: {
        break; 
      } 
      default: {
        break; 
      } 
   }
    //result
    return Promise.resolve(result);
  }

  private async DownloadTemplates(url:string,destPath:string,type:EntityType):Promise<void>
  {
    const listDownloadTemplates= await this.GetDownloadListTemplates(url);
    if(listDownloadTemplates.length==0)
    {
      return;
    }
    //next
    listDownloadTemplates.forEach(item => {
      //download item

      


      
    });

    :Array<EntityDownloadTemplate>=[];
    const pathTemplates=this._config.Folder.TemplatesDownload;
    const systemType:TypeTemplate=TypeTemplate.download;
    //download templatelist.fastiot.yaml
    const response = await axios.get(uriTemplateList);
    console.log(response.status); //200
    //const user = data.userDetails;
    console.log("=====");
    console.log(response.data);
    //console.log(user);
    //parse templatelist.fastiot.yaml
    const obj=YAML.parse(response.data);
    console.log(obj);  
    //template download
    let index=0; 
    do { 				
          let item=obj.templates[index];
          if(item) {
            const itemId=item.id;
            const itemversion=item.version;
            const uriTemplate=uriTemplateList.substring(0,uriTemplateList.lastIndexOf('/'))+"/"+itemId+".zip";
            console.log(uriTemplate);
            //existence check
            if(this.Templates.has(itemId)) {
              let existingTemplate=this.Templates.get(itemId);
              //system type checking
              if (existingTemplate?.SystemType==systemType){
                //template version comparison
                if(compare(itemversion, existingTemplate.Attributes.Version, '>')){
                  //template update with larger version
                  //download new template
                  await this.DownloadAsZipAndUnpacking(uriTemplate);
                };
              }
            }
            else{
              //download new template
              await this.DownloadAsZipAndUnpacking(uriTemplate);
            }
            //next position
            index=index+1;
          }else break;
        }  
    while(true)
    //load
    await this.LoadFromFolder(pathTemplates,systemType);




  }

  public async UpdateSystemTemplates():Promise<void>
  {

  }


  //********************************************** */
  public async Load():Promise<void>
  {
    let path=this._config.Folder.TemplatesDownload;
    await this.LoadFromFolder(path,TypeTemplate.download);
    //
    path=this._config.Folder.TemplatesUser;
    await this.LoadFromFolder(path,TypeTemplate.user);
  }

  private async LoadFromFolder(path:string,systemType:TypeTemplate):Promise<void>
  {
    //getting a list of template directories
    const files = fs.readdirSync(path);
    if (files.length==0) return;
    //checking all folders
    files.forEach(name => {
      //directory
      const dir=`${path}\\${name}`;  
      if(fs.lstatSync(dir).isDirectory())
      {
        console.log(dir);
        let newTemplate = new IotTemplate(dir,systemType);
        if(!this.Templates.has(newTemplate.Attributes.Id))
        {
          //add new
          this.Templates.set(newTemplate.Attributes.Id,newTemplate);
        }else
        {
          //update
          const existingTemplate=this.Templates.get(newTemplate.Attributes.Id);
          if(existingTemplate){
            //system type checking
            if (existingTemplate.SystemType==systemType){
                //template version comparison
                if(compare(newTemplate.Attributes.Version, existingTemplate.Attributes.Version, '>')){
                  //removal previous version
                  this.Templates.delete(existingTemplate.Attributes.Id);
                  //template update with larger version
                  this.Templates.set(newTemplate.Attributes.Id,newTemplate);
                };
              }
          }
          //
        }
      }
    });
  }

  public async DownloadAndLoad(uriTemplateList:string):Promise<void> {
    const pathTemplates=this._config.Folder.TemplatesDownload;
    const systemType:TypeTemplate=TypeTemplate.download;
    //download templatelist.fastiot.yaml
    const response = await axios.get(uriTemplateList);
    console.log(response.status); //200
    //const user = data.userDetails;
    console.log("=====");
    console.log(response.data);
    //console.log(user);
    //parse templatelist.fastiot.yaml
    const obj=YAML.parse(response.data);
    console.log(obj);  
    //template download
    let index=0; 
    do { 				
          let item=obj.templates[index];
          if(item) {
            const itemId=item.id;
            const itemversion=item.version;
            const uriTemplate=uriTemplateList.substring(0,uriTemplateList.lastIndexOf('/'))+"/"+itemId+".zip";
            console.log(uriTemplate);
            //existence check
            if(this.Templates.has(itemId)) {
              let existingTemplate=this.Templates.get(itemId);
              //system type checking
              if (existingTemplate?.SystemType==systemType){
                //template version comparison
                if(compare(itemversion, existingTemplate.Attributes.Version, '>')){
                  //template update with larger version
                  //download new template
                  await this.DownloadAsZipAndUnpacking(uriTemplate);
                };
              }
            }
            else{
              //download new template
              await this.DownloadAsZipAndUnpacking(uriTemplate);
            }
            //next position
            index=index+1;
          }else break;
        }  
    while(true)
    //load
    await this.LoadFromFolder(pathTemplates,systemType);
  }

  private async DownloadAsZipAndUnpacking(uri:string):Promise<void> {
    //clear
    //this._config.Folder.ClearTmp();
    //
    const filename = uri.split('/').pop()?.substring(0,uri.split('/').pop()?.lastIndexOf('.'));
    const fileZipPath=this._config.Folder.Temp+"\\"+filename+".zip";
    //download *.zip
    //await downloadFile(uri,fileZipPath);
    /*
    const response = await axios({
      method: 'get',
      url: uri,
      responseType: 'blob'
    });
    //save file *.zip
    fs.writeFileSync(fileZipPath,response.data,undefined);
    */
    //unpack
    let unpackPath=this._config.Folder.Temp+"\\"+filename;
    //MakeDirSync(unpackPath);
    //Put App cwRsync
    const zip = new StreamZip.async({ file: fileZipPath });
    const count = await zip.extract(null, unpackPath);
    console.log(`Extracted ${count} entries`);
    await zip.close();
    //
    let newTemplate = new IotTemplate(unpackPath,TypeTemplate.none);
    //if OK and filename==newTemplate.id
    //fs.renameSync(unpackPath,this._config.Folder.Temp+"\\"+filename);
    //unpackPath=this._config.Folder.Temp+"\\"+filename;
    //delete folder
    const destinationTemplatePath=this._config.Folder.TemplatesDownload+
      "\\"+newTemplate.Attributes.Id;
    if (fs.existsSync(destinationTemplatePath))
    {
      //removal previous version
      await this.DeletionFromDisk(destinationTemplatePath);
    }
    //copy
    const srcDir = unpackPath;
		const destDir = destinationTemplatePath;
    //MakeDirSync(destinationTemplatePath);
		// To copy a folder or file, select overwrite accordingly


    //const zip1 = new StreamZip.async({ file: fileZipPath });
    //const count1 = await zip.extract(null, destinationTemplatePath);
    //console.log(`Extracted ${count1} entries`);
    //await zip1.close();

    fs.moveSync(srcDir,destDir);
		
    /*
    try {
			fs.copyFileSync(srcDir, destDir);
			} catch (err) {
			console.error(err)
		}
    */
     
  }

  private async DeletionFromDisk(path:string):Promise<void> {
    // delete directory recursively
    await fs.rmdir(path, { recursive: true });
  }

}

export class EntityDownloadTemplate {  
  private _id: string;  
  public get Id(): string {
    return this._id;}

  private _version: string;  
  public get Version(): string {
    return this._version;}

  private _url: string;  
  public get Url(): string {
    return this._url;}
  constructor(
    id:string,
    version:string,
    url:string,
    ){
      this._id=id;
      this._version=version;
      this._url=url;
    }
 }

const finished = promisify(stream.finished);

export async function downloadFile(fileUrl: string, outputLocationPath: string): Promise<any> {
  const writer = fs.createWriteStream(outputLocationPath);
  return axios({
    method: 'get',
    url: fileUrl,
    responseType: 'stream',
  }).then(response => {
    response.data.pipe(writer);
    return finished(writer); //this is a Promise
  });
}
