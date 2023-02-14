import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {EntityType} from '../Entity/EntityType';
import {EntityBase} from '../Entity/EntityBase';
import {EntityCollection,ContainsType} from '../Entity/EntityCollection';
import {EntityBaseAttribute} from '../Entity/EntityBaseAttribute';
import {IotTemplate} from './IotTemplate';
import {IotTemplateAttribute} from './IotTemplateAttribute';
import {IotResult,StatusResult } from '../IotResult';
import {IotTemplateRecovery} from './IotTemplateRecovery';
import {IotTemplateDownloader} from './IotTemplateDownloader';
import {EntityDownload} from '../Entity/EntityDownloader';

export class IotTemplateCollection extends EntityCollection<IotTemplateAttribute,IotTemplate> {
  
  constructor(basePath: string, recoverySourcePath:string, logCallback:(value:string) =>void,
    versionExt:string,pathFolderSchemas: string
    ){
      super(basePath,recoverySourcePath,logCallback,versionExt,pathFolderSchemas);  
  }

  public async LoadTemplatesSystem():Promise<void>
  {
    this.LogCallback("Loading system templates");
    const type=EntityType.system;
    //
    const path=`${this.BasePath}\\${type}`;
    const result = await this.LoadFromFolder(path,type,this.RecoverySourcePath);
    this.LogCallback(`${result.Status}. ${result.Message}. ${result.SystemMessage}`);
  }

  public async LoadTemplatesUser():Promise<void>
  {
    this.LogCallback("Loading custom templates");
    const type=EntityType.user;
    //
    const path=`${this.BasePath}\\${type}`;
    const result = await this.LoadFromFolder(path,type,undefined);
    this.LogCallback(`${result.Status}. ${result.Message}. ${result.SystemMessage}`);
  }

  public async LoadTemplatesCommunity():Promise<void>
  {
    this.LogCallback("Loading community templates");
    const type=EntityType.community;
    //
    const path=`${this.BasePath}\\${type}`;
    const result = await this.LoadFromFolder(path,type,undefined);
    this.LogCallback(`${result.Status}. ${result.Message}. ${result.SystemMessage}`);
  }

  protected async LoadFromFolder(path:string, type:EntityType,recoverySourcePath:string|undefined):Promise<IotResult>
  {
    let result= new IotResult(StatusResult.Ok, undefined,undefined);
    //Recovery
    let recovery = new IotTemplateRecovery(type); 
    if(type==EntityType.system&&recoverySourcePath)
    {
      result=recovery.RestoryDirStructure(recoverySourcePath,path);
      if(result.Status==StatusResult.Error) return Promise.resolve(result);
    } 
    //
    const listFolders=this.GetListDirWithEntity(path);
    //ckeck
    if (listFolders.length==0)
    {
      result=new IotResult(StatusResult.Ok,`${path} folder is empty`,undefined);
      return Promise.resolve(result);
    }
    //checking all folders
    listFolders.forEach(dir => {
      const filePath=`${dir}\\template.fastiot.yaml`;
      this.LogCallback(`Template initialization: ${filePath}`);
      let template = new IotTemplate(this._pathFolderSchemas);
      template.Init(type,filePath,recoverySourcePath);
      if(!template.IsValid&&type==EntityType.system)
      {
        //Recovery
        this.LogCallback(`Template recovery: ${filePath}`);
        result= template.Recovery();
        if(result.Status==StatusResult.Ok)
          {
            template.Init(type,filePath,recoverySourcePath);
          }else{
            this.LogCallback(`${result.Status}. ${result.Message}. ${result.SystemMessage}`);
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
              this.LogCallback(`Template added: ${filePath}`);
              break; 
            } 
            case ContainsType.yesVersionSmaller: {
              this.Update(template.Attributes.Id,template);
              this.LogCallback(`Template updated: ${filePath}`);
              break; 
            }
            default: { 
              //statements; 
              break; 
            } 
          }
        }else{
          this.LogCallback(`Error. The template ${template.DescriptionFilePath} is for a newer version of the extension.` +
            `Update the extension.`);
        }
      }else{
        this.LogCallback(`Error. The template ${template.DescriptionFilePath} has not been validated`);
        this.LogValidationErrors(template.ValidationErrors);
      }
    });
    //result
    if(this.Count>0){
      result= new IotResult(StatusResult.Ok,`Loading templates from ${path} folder successfully completed`,undefined);
    }else{
      result= new IotResult(StatusResult.Error,` No template was loaded from the ${path} folder`,undefined);
    }
    return Promise.resolve(result);
  }

  public async UpdateSystemTemplate(url:string,tempPath:string):Promise<void>
  {
    this.LogCallback("Updating system templates");
    const result = await this.UpdateTemplate(url,EntityType.system,tempPath);
    this.LogCallback(`${result.Status}. ${result.Message}. ${result.SystemMessage}`);
    //result
    if(!(result.Status==StatusResult.Error)) this.LogCallback("Update of system templates completed successfully");
    return;
  }

  public async UpdateTemplate(url:string,type:EntityType,tempPath:string):Promise<IotResult>
  {
    const destPath=`${this.BasePath}\\${type}`;
    let downloader = new IotTemplateDownloader();
    let result= new IotResult(StatusResult.None,undefined,undefined);
    result= await downloader.GetDownloadListTemplate(url);
    if(result.Status==StatusResult.Error) return Promise.resolve(result);
    this.LogCallback(`List of templates loaded ${url}`);
    let listDownload:Array<EntityDownload>=result.returnObject;
    if(listDownload.length==0)
    {
      result= new IotResult(StatusResult.Ok,`Url: ${url}. No templates to download`,undefined);
      return Promise.resolve(result);
    }
    //next
    listDownload.forEach(async (item) => {
      if(this.IsCompatible2(item.ForVersionExt,item.platform))
      {
        const isContains=this.Contains2(item.Id,EntityType.system,item.Version);
        switch(isContains) { 
          case ContainsType.no: {
            result= await downloader.DownloadTemplate(item,tempPath);
            if(result.Status==StatusResult.Ok)
            {
              const unpackPath= <string> result.returnObject;
              let template=new  IotTemplate(this._pathFolderSchemas);
              template.Init(EntityType.system,unpackPath,undefined);
              if(template.IsValid)
              {
                template.Move(destPath);
                this.Add(template.Attributes.Id,template);
              } else {
                this.LogCallback(`Error. The template ${template.DescriptionFilePath} has not been validated`);
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
              let template=new  IotTemplate(this._pathFolderSchemas);
              template.Init(EntityType.system,unpackPath,undefined);
              if(template.IsValid)
              {
                template.Move(destPath);
                this.Update(template.Attributes.Id,template);
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
        this.LogCallback(`Error. The template ${item.Url} is for a newer version of the extension.` +
            `Update the extension.`);
      }
    });
    //result
    result= new IotResult(StatusResult.Ok,undefined,undefined);
    return Promise.resolve(result);
  }

}
