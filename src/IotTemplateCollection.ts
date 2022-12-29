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
import {IotTemplate,TypeTemplate} from './IotTemplate';
import {GetUniqueLabel,MakeDirSync,MergeWithDictionary,DeleteComments} from './Helper/IoTHelper';

export class IotTemplateCollection {
  public Templates:Map<string,IotTemplate>;
  private _config:IotConfiguration;
  constructor(config:IotConfiguration
    ){
      this.Templates= new Map<string,IotTemplate>();
      this._config=config;
    }
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
