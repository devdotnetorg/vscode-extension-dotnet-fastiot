import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import {EntityType} from '../Entity/EntityType';
import {EntityCollection,ContainsType} from '../Entity/EntityCollection';
import {IotTemplate} from './IotTemplate';
import {IotTemplateAttribute} from './IotTemplateAttribute';
import {IotResult,StatusResult } from '../IotResult';
import {IoTHelper} from '../Helper/IoTHelper';
import {IotTemplateRecovery} from './IotTemplateRecovery';
import {IotTemplateDownloader} from './IotTemplateDownloader';
import {EntityDownload} from '../Entity/EntityDownloader';
import {IContexUI} from '../ui/IContexUI';

export class IotTemplateCollection extends EntityCollection<IotTemplateAttribute,IotTemplate> {
  
  constructor(
    basePath: string, recoverySourcePath:string, versionExt:string,
    pathFolderSchemas: string,contextUI:IContexUI
    ){
      super(basePath,recoverySourcePath,versionExt,pathFolderSchemas,contextUI);  
  }

  public async LoadTemplatesSystem():Promise<void>
  {
    this.ContextUI.Output("Loading system templates");
    const type=EntityType.system;
    //
    const path=`${this.BasePath}\\${type}`;
    const result = await this.LoadFromFolder(path,type,this.RecoverySourcePath);
    this.ContextUI.Output(result.toString());
  }

  public async LoadTemplatesUser():Promise<void>
  {
    this.ContextUI.Output("Loading custom templates");
    const type=EntityType.user;
    //
    const path=`${this.BasePath}\\${type}`;
    const result = await this.LoadFromFolder(path,type,undefined);
    this.ContextUI.Output(result.toString());
  }

  public async LoadTemplatesCommunity():Promise<void>
  {
    this.ContextUI.Output("Loading community templates");
    const type=EntityType.community;
    //
    const path=`${this.BasePath}\\${type}`;
    const result = await this.LoadFromFolder(path,type,undefined);
    this.ContextUI.Output(`${result.Status}. ${result.Message}. ${result.SystemMessage}`);
  }

  protected async LoadFromFolder(pathFolder:string, type:EntityType,recoverySourcePath:string|undefined):Promise<IotResult>
  {
    let result= new IotResult(StatusResult.Ok, undefined,undefined);
    //Recovery
    let recovery = new IotTemplateRecovery(type); 
    if(type==EntityType.system&&recoverySourcePath)
    {
      result=recovery.RestoryDirStructure(recoverySourcePath,pathFolder);
      if(result.Status==StatusResult.Error) return Promise.resolve(result);
    } 
    //
    const listFolders=IoTHelper.GetListDir(pathFolder);
    //ckeck
    if (listFolders.length==0)
    {
      result=new IotResult(StatusResult.Ok,`${pathFolder} folder is empty. There are no templates to load.`);
      return Promise.resolve(result);
    }
    //checking all folders
    listFolders.forEach(dir => {
      const filePath=`${dir}\\template.fastiot.yaml`;
      //this.LogCallback(`Template initialization: ${filePath}`);
      let template = new IotTemplate(this._pathFolderSchemas);
      template.Init(type,filePath,recoverySourcePath);
      if(!template.IsValid&&type==EntityType.system)
      {
        //Recovery
        this.ContextUI.Output(`Template recovery: ${path.dirname(filePath)}`);
        result= template.Recovery();
        if(result.Status==StatusResult.Ok)
          {
            template.Init(type,filePath,recoverySourcePath);
          }else{
            this.ContextUI.Output(`Error. Template restore error. ${result.Message}. ${result.SystemMessage}`);
          }
      }
      //main
      if(template.IsValid)
      {
        //this.LogCallback(`Template isValid: ${filePath}`);
        if(this.IsCompatible1(template))
        {
          const isContains=this.Contains1(template);
          //
          switch(isContains) { 
            case ContainsType.no: {
              this.Add(template.Attributes.Id,template);
              this.ContextUI.Output(`Template added: [${template.Attributes.Id}] ${template.ParentDir}`);
              break; 
            } 
            case ContainsType.yesVersionSmaller: {
              this.Update(template.Attributes.Id,template);
              this.ContextUI.Output(`Template updated: ${filePath}`);
              break; 
            }
            default: { 
              //statements; 
              break; 
            } 
          }
        }else{
          this.ContextUI.Output(`Error. The template ${template.DescriptionFilePath} is for a newer version of the extension.` +
            `Update the extension.`);
        }
      }else{
        this.ContextUI.Output(`Error. The template ${template.DescriptionFilePath} has not been validated`);
        this.LogValidationErrors(template.ValidationErrors);
        //delete system template
        if(type==EntityType.system) {
          result= template.Remove();
          this.ContextUI.Output(`${result.Status}. ${result.Message}. ${result.SystemMessage}`);
        }
      }
    });
    //result
    if(this.Count>0){
      result= new IotResult(StatusResult.Ok,`Loading templates from ${pathFolder} folder successfully completed`,undefined);
    }else{
      result= new IotResult(StatusResult.Error,` No template was loaded from the ${pathFolder} folder`,undefined);
    }
    return Promise.resolve(result);
  }

  public async UpdateSystemTemplate(url:string,tempPath:string):Promise<IotResult>
  {
    const result = await this.UpdateTemplate(url,EntityType.system,tempPath);
    return result;
  }

  public async UpdateTemplate(url:string,type:EntityType,tempPath:string):Promise<IotResult>
  {
    const destPath=`${this.BasePath}\\${type}`;
    let downloader = new IotTemplateDownloader();
    let result= new IotResult(StatusResult.None,undefined,undefined);
    result= await downloader.GetDownloadListTemplate(url);
    if(result.Status==StatusResult.Error) return Promise.resolve(result);
    this.ContextUI.Output(`List of templates loaded ${url}`);
    let listDownload:Array<EntityDownload>=result.returnObject;
    if(listDownload.length==0)
    {
      result= new IotResult(StatusResult.Ok,`Url: ${url}. No templates to download`);
      return Promise.resolve(result);
    }
    //next
    let index:number=0;
    do{
      let item = listDownload[index];
      if(item)
        {
          //parse
          if(this.IsCompatible2(item.ForVersionExt,item.platform))
          {
            const isContains=this.Contains2(item.Id,EntityType.system,item.Version);
            switch(isContains) { 
              case ContainsType.no: {
                result= await downloader.DownloadTemplate(item,tempPath);
                if(result.Status==StatusResult.Ok)
                {
                  const unpackPath= <string> result.returnObject;
                  const filePath = path.join(unpackPath, "template.fastiot.yaml");
                  let template=new  IotTemplate(this._pathFolderSchemas);
                  template.Init(EntityType.system,filePath,undefined);
                  if(template.IsValid)
                  {
                    result=template.Move(path.join(destPath, template.Attributes.Id));
                    if(result.Status==StatusResult.Error)
                    {
                      this.ContextUI.Output(`Error. The template ${template.DescriptionFilePath}. ${result.Message}. ${result.SystemMessage}`);
                      break;
                    } 
                    this.Add(template.Attributes.Id,template);
                    this.ContextUI.Output(`Template added: [${template.Attributes.Id}] ${template.ParentDir}`);
                  } else {
                    this.ContextUI.Output(`Error. The template ${template.DescriptionFilePath} has not been validated`);
                    this.LogValidationErrors(template.ValidationErrors);
                  }
                }
                break; 
              }
              case ContainsType.yesVersionSmaller: {
                result= await downloader.DownloadTemplate(item,tempPath);
                if(result.Status==StatusResult.Ok)
                {
                  const unpackPath= <string> result.returnObject;
                  const filePath = path.join(unpackPath, "template.fastiot.yaml");
                  let template=new  IotTemplate(this._pathFolderSchemas);
                  template.Init(EntityType.system,filePath,undefined);
                  if(template.IsValid)
                  {
                    result=template.Move(path.join(destPath, template.Attributes.Id));
                    if(result.Status==StatusResult.Error)
                    {
                      this.ContextUI.Output(`Error. The template ${template.DescriptionFilePath}. ${result.Message}. ${result.SystemMessage}`);
                      break;
                    }
                    this.Update(template.Attributes.Id,template);
                    this.ContextUI.Output(`Template updated: [${template.Attributes.Id}] ${template.DescriptionFilePath}`);
                  } else {
                    this.ContextUI.Output(`Error. The template ${template.DescriptionFilePath} has not been validated`);
                    this.LogValidationErrors(template.ValidationErrors);
                  }
                }
                break; 
              }
              default: { 
                //statements; 
                break; 
              } 
            }
        }else{
          this.ContextUI.Output(`Error. The template ${item.Url} is for a newer version of the extension.` +
              `Update the extension.`);
        }
        //
      }else break;      
      index++;
    }while(true)
    //result
    result= new IotResult(StatusResult.Ok,`Update of ${type} templates completed successfully`);
    return Promise.resolve(result);
  }

  public RestoreSystemTemplates()
  {
    const path=`${this.BasePath}\\${EntityType.system}`;
    if (fs.existsSync(path)) {
      //clear
      fs.emptyDirSync(path);
    }
  }

}
