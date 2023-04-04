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
import {IotConfiguration} from '../Configuration/IotConfiguration';

export class IotTemplateCollection extends EntityCollection<IotTemplateAttribute,IotTemplate> {
  
  private _config:IotConfiguration;

  constructor(
    basePath: string, recoverySourcePath:string, versionExt:string,
    pathFolderSchemas: string,contextUI:IContexUI,config:IotConfiguration
    ){
      super(basePath,recoverySourcePath,versionExt,pathFolderSchemas,contextUI);
      this._config=config;
  }

  public async LoadTemplatesSystem():Promise<void>
  {
    this.ContextUI.Output("☑️ Loading system templates");
    const type=EntityType.system;
    const path=`${this.BasePath}\\${type}`;
    const result = await this.LoadFromFolder(path,type,this.RecoverySourcePath);
    this.ContextUI.Output(result);
  }

  public async LoadTemplatesUser():Promise<void>
  {
    this.ContextUI.Output("☑️ Loading custom templates");
    const type=EntityType.user;
    //
    const path=`${this.BasePath}\\${type}`;
    const result = await this.LoadFromFolder(path,type,undefined);
    this.ContextUI.Output(result);
  }

  public async LoadTemplatesCommunity():Promise<void>
  {
    this.ContextUI.Output("☑️ Loading community templates");
    const type=EntityType.community;
    //
    const path=`${this.BasePath}\\${type}`;
    const result = await this.LoadFromFolder(path,type,undefined);
    this.ContextUI.Output(`${result.Status}. ${result.Message}. ${result.SystemMessage}`);
  }

  protected async LoadFromFolder(pathFolder:string, type:EntityType,recoverySourcePath:string|undefined):Promise<IotResult>
  {
    let result:IotResult;
    const templatesCountBegin=this.Count;
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
      result=new IotResult(StatusResult.Ok,`${pathFolder} folder is empty. There are no templates to load`);
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
          template.Init(type,filePath,recoverySourcePath);
          else this.ContextUI.Output(result);
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
              this.ContextUI.Output(`Template updated: [${template.Attributes.Id}] ${template.ParentDir}`);
              break; 
            }
            default: {
              this.ContextUI.Output(`Adding a  template was skipped because already in the collection: [${template.Attributes.Id}] ${template.ParentDir}`);
              break; 
            } 
          }
        }else{
          this.ContextUI.Output(`[ERROR] The template ${template.ParentDir} is for a newer version of the extension. ` +
            `Update the extension.`);
        }
      }else{
        this.ContextUI.Output(`[ERROR] The template ${template.ParentDir} has not been validated.`);
        this.ContextUI.Output(template.ValidationErrorsToString);
        //delete system template
        if(type==EntityType.system) {
          result= template.Remove();
          this.ContextUI.Output(result);
        }
      }
    });
    //result
    if((this.Count-templatesCountBegin)>0){
      result= new IotResult(StatusResult.Ok,`Loading templates from ${pathFolder} folder successfully completed`);
    }else{
      result= new IotResult(StatusResult.None,`No template was loaded from the ${pathFolder} folder`);
    }
    return Promise.resolve(result);
  }

  public async UpdateSystemTemplate(url:string,tempPath:string):Promise<IotResult>
  {
    const result = await this.UpdateTemplate(url,EntityType.system,tempPath);
    if(result.Status==StatusResult.Error)
      result.AddMessage(`Error updating system templates`);
    return result;
  }

  public async UpdateCommunityTemplate(urls:string[],tempPath:string):Promise<IotResult>
  {
    let result:IotResult;
    const type=EntityType.community;
    //Check urls
    if(urls.length==0) {
      result= new IotResult(StatusResult.No,`No update sources for community templates`);
      return Promise.resolve(result);
    }
    //list
    let index:number=0;
    do{
      const url = urls[index];
      if(url) {
        //update
        result = await this.UpdateTemplate(url,type,tempPath);
        if(result.Status==StatusResult.Error)
          this.ContextUI.Output(result);
        //
      }else break;
      index++;
    }while(true)
    //result
    result= new IotResult(StatusResult.Ok,`Update of ${type} templates completed successfully`);
    return Promise.resolve(result);
  }

  public async UpdateTemplate(url:string,type:EntityType,tempPath:string):Promise<IotResult>
  {
    const destPath=`${this.BasePath}\\${type}`;
    let downloader = new IotTemplateDownloader();
    let result:IotResult;
    this.ContextUI.Output(`🔗 Downloading a list of templates to update: ${url}`);
    result= await downloader.GetDownloadListTemplate(url);
    if(result.Status==StatusResult.Error) return Promise.resolve(result);
    this.ContextUI.Output(`🔗 List of templates loaded ${url}`);
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
                    if(result.Status==StatusResult.Error) {
                      this.ContextUI.Output(result);
                      break;
                    } 
                    this.Add(template.Attributes.Id,template);
                    this.ContextUI.Output(`Template added/updated: [${template.Attributes.Id}] ${template.ParentDir}`);
                  } else {
                    this.ContextUI.Output(`[ERROR] The template ${template.DescriptionFilePath} has not been validated`);
                    this.ContextUI.Output(template.ValidationErrorsToString);
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
                    if(result.Status==StatusResult.Error) {
                      this.ContextUI.Output(result);
                      break;
                    } 
                    this.Update(template.Attributes.Id,template);
                    this.ContextUI.Output(`Template added/updated: [${template.Attributes.Id}] ${template.ParentDir}`);
                  } else {
                    this.ContextUI.Output(`[ERROR] The template ${template.DescriptionFilePath} has not been validated`);
                    this.ContextUI.Output(template.ValidationErrorsToString);
                  }
                }
              }
              default: { 
                //statements; 
                break; 
              } 
            }
        }else{
          this.ContextUI.Output(`Error. The template ${item.Url} is for a newer version of the extension. ` +
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

  public async LoadTemplatesAsync(force:boolean=false)
  {
    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "Loading ... ",
      cancellable: false
    }, (progress, token) => {
      //token.onCancellationRequested(() => {
      //  console.log("User canceled the long running operation");
      //});
      return new Promise(async (resolve, reject) => {
        //main code
        progress.report({ message: "Preparing to load",increment: 20 }); //20
        //Preparing
        let result= new IotResult(StatusResult.None,undefined,undefined);
        this.Clear();
        let url:string="";
        if(this._config.ExtMode==vscode.ExtensionMode.Production)
        {
          url="https://raw.githubusercontent.com/devdotnetorg/vscode-extension-dotnet-fastiot/master/templates/system/templatelist.fastiot.yaml";
        }else{
          //for test
          url="https://raw.githubusercontent.com/devdotnetorg/vscode-extension-dotnet-fastiot/dev/templates/system/templatelist.fastiot.yaml";
        }
        this.ContextUI.Output("-------- Loading templates -------");
        //Loading system templates
        progress.report({ message: "Loading system templates",increment: 20 }); //40
        await this.LoadTemplatesSystem();
        //Updating templates
        progress.report({ message: "Updating templates",increment: 20 }); //60
        //To get the number of hours since Unix epoch, i.e. Unix timestamp:
        const dateNow=Math.floor(Date.now() / 1000/ 3600);
        const TimeHasPassedHours=dateNow-this._config.BuiltInConfig.LastUpdateTemplatesHours;
        this.ContextUI.Output("📥 Updating templates:");
        if(force||(this._config.IsUpdateTemplates&&(TimeHasPassedHours>=this._config.UpdateIntervalTemplatesHours))){
          //system
          this.ContextUI.Output("☑️ Updating system templates");
          result=await this.UpdateSystemTemplate(url,this._config.Folder.Temp);
          this.ContextUI.Output(result);
          //timestamp of last update
          if(result.Status==StatusResult.Ok){
            this._config.BuiltInConfig.LastUpdateTemplatesHours=<number>dateNow;
            this._config.BuiltInConfig.Save();
          }
          //community
          this.ContextUI.Output("☑️ Updating community templates");
          result=await this.UpdateCommunityTemplate(this._config.ListSourceUpdateTemplateCommunity,this._config.Folder.Temp);
          this.ContextUI.Output(result);
        } else this.ContextUI.Output(`Disabled or less than ${this._config.UpdateIntervalTemplatesHours} hour(s) have passed since the last update.`);
        //Loading custom templates
        progress.report({ message: "Loading custom templates",increment: 20 }); //80
        await this.LoadTemplatesUser();
        const endMsg=`📚 ${this.Count} template(s) available.`;
        this.ContextUI.Output(endMsg);
        this.ContextUI.Output("----------------------------------");
        progress.report({ message: "Templates loaded" , increment: 20 }); //100
        resolve(endMsg);
        //end
      });
    });
  }

  public RestoreSystemTemplates(force=false)
  {
    //clear
    if (fs.existsSync(this._config.Folder.TemplatesSystem))
      fs.emptyDirSync(this._config.Folder.TemplatesSystem);
    this.LoadTemplatesAsync(force);
  }

}
