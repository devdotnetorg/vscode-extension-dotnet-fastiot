import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import { compare } from 'compare-versions';
import { EntityBase } from './EntityBase';
import { EntityBaseAttribute } from './EntityBaseAttribute';
import { EntityType } from './EntityType';
import { EntityRecovery } from './EntityRecovery';
import { IotResult,StatusResult } from '../IotResult';
import { EventDispatcher,Handler } from '../EventDispatcher';
import { LogLevel } from '../LogLevel';
import { IoTHelper } from '../Helper/IoTHelper';
import { EntityDownload, EntityDownloader } from './EntityDownloader';
import { IotBuiltInConfig } from '../Configuration/IotBuiltInConfig';

export abstract class EntityCollection <A extends EntityBaseAttribute, T extends EntityBase<A>> {
  
  protected _items:Map<string,T>;
  protected readonly _entityIntLabel:string; //for understandable log
  private readonly TCreator: new(pathFolderSchemas: string) => T;
  protected readonly Config:IConfigEntityCollection;

  public get Count(): number {
      return this._items.size;}

  //Event--------------------------------------
  protected ChangedStateDispatcher = new EventDispatcher<IChangedStateEvent>();

  public OnChangedStateSubscribe(handler: Handler<IChangedStateEvent>):Handler<IChangedStateEvent> {
        this.ChangedStateDispatcher.Register(handler);
        return handler;
  }

  public OnChangedStateUnsubscribe (handler: Handler<IChangedStateEvent>) {
    this.ChangedStateDispatcher.Unregister(handler);
  }

  protected FireChangedState(event: IChangedStateEvent) { 
      this.ChangedStateDispatcher.Fire(event);
  }
  //-------------------------------------------

  constructor(
    entityIntLabel:string, TCreator: new(pathFolderSchemas: string) => T,
    config:IConfigEntityCollection
    ){
      this._items = new Map<string,T>(); 
      this._entityIntLabel=entityIntLabel;
      this.TCreator=TCreator;
      this.Config=config;
    }

  public Add(value:T):boolean
  {
    try {
      this._items.set(value.Attributes.Id,value);
      return true;
    } catch (err: any){
      return false;
    }
  }

  public Remove(id:string):boolean
  {
    try {
      this._items.delete(id);
      return true;
    } catch (err: any){
      return false;
    }
  }

  public Update(newValue:T):boolean
  {
    this.Remove(newValue.Attributes.Id);
    return this.Add(newValue);
  }

  public Clear()
  {
    this._items.clear();
  }

  protected IsCompatibleByVersionExtAndPlatform(value:T):boolean
  {
    const forVersionExt=value.Attributes.ForVersionExt;
    const platform = value.Attributes.platform;
    return this.IsCompatibleByVersionExtAndPlatform2(forVersionExt,platform);
  }

  protected IsCompatibleByVersionExtAndPlatform2(forVersionExt:string,platform:Array<string>):boolean
  {
    const currentVersionExt=this.Config.extVersion;
    const isCompatibleVersion=compare(`${currentVersionExt}`,`${forVersionExt}`, '>=');
    const currentPlatform=process.platform.toString();
    const foundPlatform = platform.find(element => element == currentPlatform);
    let isCompatiblePlatform=false;
    if(foundPlatform) isCompatiblePlatform=true;
    return (isCompatibleVersion&&isCompatiblePlatform);
    //if(isCompatibleVersion&&isCompatiblePlatform) return true; else return false;
  }

  protected Contains(value:T):ContainsType
  {
    return this.Contains2(value.Attributes.Id,value.Type,value.Attributes.Version);
  }

  protected Contains2(id:string,type:EntityType,version:string):ContainsType
  {
    // type:EntityType, version:string
    if(!this._items.has(id)) return ContainsType.no;
    let element=this._items.get(id);
    const result=element?.CompareByVersion2(type,version);
    //0 - equal, 1 - entityBase up, -1 - entityBase down
    if(result==0) {
      return ContainsType.yesSameVersion;
    } else if (result==1) return ContainsType.yesVersionSmaller;
    return ContainsType.yesMoreVersion;
  }

  public SelectByEndDeviceArchitecture(endDeviceArchitecture?:string):Array<T>
  {
    let listEntitys:Array<T>=[];
    if(!endDeviceArchitecture) return listEntitys;
    this._items.forEach(entiny => {
      //Entiny
      let found=entiny.Attributes.EndDeviceArchitecture.find(value=>value==endDeviceArchitecture);
      if(found) listEntitys.push(entiny);
      });
    return listEntitys;
  }

  public FindById(idEntity:string):T|undefined
  {
    return this._items.get(idEntity);
  }

  protected async LoadFromFolder(pathFolder:string, type:EntityType):Promise<IotResult>
  {
    let result:IotResult;
    const entitysCountBegin=this.Count;
    //Recovery
    let recovery = new EntityRecovery(); 
    if(type==EntityType.system) {
      result=recovery.RestoryDirStructure(this.Config.recoverySourcePath,pathFolder);
      if(result.Status==StatusResult.Error) return Promise.resolve(result);
    }
    const listFolders=IoTHelper.GetListDir(pathFolder);
    //ckeck
    if (listFolders.length==0) {
      result=new IotResult(StatusResult.Ok,`${pathFolder} folder is empty. There are no ${this._entityIntLabel}s to load`);
      return Promise.resolve(result);
    }
    //checking all folders
    listFolders.forEach(dir => {
      const filePath=`${dir}\\${this._entityIntLabel.toLowerCase()}.fastiot.yaml`;
      let entity = new this.TCreator(this.Config.schemasFolderPath);
      entity.Init(type,filePath,this.Config.recoverySourcePath);
      if(!entity.IsValid&&type==EntityType.system)
      {
        //Recovery
        this.FireChangedState({
          message:`${this._entityIntLabel} recovery: ${path.dirname(filePath)}`,
          logLevel:LogLevel.Debug,
          increment:undefined
        });
        result= entity.Recovery();
        if(result.Status==StatusResult.Ok) {
          entity.Init(type,filePath,this.Config.recoverySourcePath);}
          else {
            this.FireChangedState({
              message:result,
              logLevel:LogLevel.Debug,
              increment:undefined
            });
          }
      }
      //main
      if(entity.IsValid) {
        this.FireChangedState({
          message:`${this._entityIntLabel} is valid: [${entity.Attributes.Id}]`,
          logLevel:LogLevel.Debug,
          increment:undefined
        });
        if(this.IsCompatibleByVersionExtAndPlatform(entity)) {
          const isContains=this.Contains(entity);
          //
          switch(isContains) { 
            case ContainsType.no: {
              this.Add(entity);
              this.FireChangedState({
                message:`${this._entityIntLabel} added: [${entity.Attributes.Id}] ${entity.RootDir}`,
                logLevel:LogLevel.Debug,
                increment:undefined
              });
              break; 
            } 
            case ContainsType.yesVersionSmaller: {
              this.Update(entity);
              this.FireChangedState({
                message:`${this._entityIntLabel} updated: [${entity.Attributes.Id}] ${entity.RootDir}`,
                logLevel:LogLevel.Debug,
                increment:undefined
              });
              break; 
            }
            default: {
              this.FireChangedState({
                message:`Adding a ${this._entityIntLabel} was skipped because already in the collection: [${entity.Attributes.Id}] ${entity.RootDir}`,
                logLevel:LogLevel.Debug,
                increment:undefined
              });
              break; 
            } 
          }
        }else{
          result = new IotResult(StatusResult.Error,`The ${this._entityIntLabel} ${entity.RootDir} is for a newer version of the extension. ` +
              `Update the extension.`)
          this.FireChangedState({
            message:result,
            logLevel:undefined,
            increment:undefined
          });
        }
      }else{
        result = new IotResult(StatusResult.Error,`The ${this._entityIntLabel} ${entity.RootDir} has not been validated.`)
        this.FireChangedState({
          message:result,
          logLevel:undefined,
          increment:undefined
        });
        this.FireChangedState({
          message:entity.ValidationErrorsToString,
          logLevel:LogLevel.Debug,
          increment:undefined
        });
        //delete system entity
        if(type==EntityType.system) {
          result= entity.Remove();
          this.FireChangedState({
            message:result,
            logLevel:LogLevel.Debug,
            increment:undefined
          });
        }
      }
    });
    //result
    if((this.Count-entitysCountBegin)>0) {
      result= new IotResult(StatusResult.Ok,`Loading ${this._entityIntLabel}s from ${pathFolder} folder successfully completed`);
    }else{
      result= new IotResult(StatusResult.None,`No ${this._entityIntLabel} was loaded from the ${pathFolder} folder`);
    }
    return Promise.resolve(result);
  }

  protected async UpdateEntitiesFromUrl(url:string,type:EntityType):Promise<IotResult>
  {
    const destPath=`${this.Config.baseStoragePath}\\${type}`;
    let downloader = new EntityDownloader();
    let result:IotResult;
    this.FireChangedState({
      message:`🔗 Downloading a list of ${this._entityIntLabel}s to update: ${url}`,
      logLevel:LogLevel.Debug,
      increment:undefined
    });
    result= await downloader.GetDownloadListEntity(url);
    if(result.Status==StatusResult.Error) {
      result.AddMessage(`Error updating ${type} ${this._entityIntLabel}s`);
      return Promise.resolve(result);
    }
    this.FireChangedState({
      message:`🔗 List of ${this._entityIntLabel}s loaded ${url}`,
      logLevel:LogLevel.Debug,
      increment:undefined
    });
    let listDownload:Array<EntityDownload>=result.returnObject;
    if(listDownload.length==0) {
      result= new IotResult(StatusResult.Ok,`Url: ${url}. No ${this._entityIntLabel}s to download`);
      return Promise.resolve(result);
    }
    //next
    let index:number=0;
    do{
      let item = listDownload[index];
      if(item) {
          //parse
          if(this.IsCompatibleByVersionExtAndPlatform2(item.ForVersionExt,item.platform)) {
            const isContains=this.Contains2(item.Id,EntityType.system,item.Version);
            switch(isContains) { 
              case ContainsType.no: {
                result= await downloader.DownloadEntity(item,this.Config.tempFolderPath);
                if(result.Status==StatusResult.Ok) {
                  const unpackPath= <string> result.returnObject;
                  const filePath = path.join(unpackPath, `${this._entityIntLabel.toLowerCase()}.fastiot.yaml`);
                  let entity= new this.TCreator(this.Config.schemasFolderPath);
                  entity.Init(EntityType.system,filePath,undefined);
                  if(entity.IsValid) {
                    result=entity.Move(path.join(destPath, entity.Attributes.Id));
                    if(result.Status==StatusResult.Error) {
                      this.FireChangedState({
                        message:result,
                        logLevel:LogLevel.Debug,
                        increment:undefined
                      });
                      break;
                    } 
                    this.Add(entity);
                    this.FireChangedState({
                      message:` ${this._entityIntLabel} added/updated: [${entity.Attributes.Id}] ${entity.RootDir}`,
                      logLevel:LogLevel.Debug,
                      increment:undefined
                    });
                  } else {
                    result = new IotResult(StatusResult.Error,`The  ${this._entityIntLabel} ${entity.YAMLFilePath} has not been validated`)
                    this.FireChangedState({
                      message: result,
                      logLevel:LogLevel.Debug,
                      increment:undefined
                    });
                    this.FireChangedState({
                      message:entity.ValidationErrorsToString,
                      logLevel:LogLevel.Debug,
                      increment:undefined
                    });
                  }
                }
                break; 
              }
              case ContainsType.yesVersionSmaller: {
                result= await downloader.DownloadEntity(item,this.Config.tempFolderPath);
                if(result.Status==StatusResult.Ok) {
                  const unpackPath= <string> result.returnObject;
                  const filePath = path.join(unpackPath, ` ${this._entityIntLabel.toLowerCase()}.fastiot.yaml`);
                  let entity= new this.TCreator(this.Config.schemasFolderPath);
                  entity.Init(EntityType.system,filePath,undefined);
                  if(entity.IsValid) {
                    result=entity.Move(path.join(destPath, entity.Attributes.Id));
                    if(result.Status==StatusResult.Error) {
                      this.FireChangedState({
                        message:result,
                        logLevel:LogLevel.Debug,
                        increment:undefined
                      });
                      break;
                    } 
                    this.Update(entity);
                    this.FireChangedState({
                      message:` ${this._entityIntLabel} added/updated: [${entity.Attributes.Id}] ${entity.RootDir}`,
                      logLevel:LogLevel.Debug,
                      increment:undefined
                    });
                  } else {
                    result = new IotResult(StatusResult.Error,`The  ${this._entityIntLabel} ${entity.YAMLFilePath} has not been validated`)
                    this.FireChangedState({
                      message: result,
                      logLevel:LogLevel.Debug,
                      increment:undefined
                    });
                    this.FireChangedState({
                      message:entity.ValidationErrorsToString,
                      logLevel:LogLevel.Debug,
                      increment:undefined
                    });

                  }
                }
              }
              default: { 
                //statements; 
                break; 
              } 
            }
        }else{
          result = new IotResult(StatusResult.Error,`Error. The ${this._entityIntLabel} ${item.Url} is for a newer version of the extension. ` +
          `Update the extension.`);
          this.FireChangedState({
            message: result,
            logLevel:LogLevel.Debug,
            increment:undefined
          });
        }
        //
      }else break;      
      index++;
    }while(true)
    //result
    result= new IotResult(StatusResult.Ok,`Update of ${type} ${this._entityIntLabel}s completed successfully`);
    return Promise.resolve(result);
  }

  protected async UpdateEntitiesFromUrls(urls:string[],type:EntityType):Promise<IotResult>
  {
    let result:IotResult;
    //Check urls
    if(urls.length==0) {
      result= new IotResult(StatusResult.No,`No update sources for community  ${this._entityIntLabel}s`);
      return Promise.resolve(result);
    }
    //list
    let index:number=0;
    do{
      const url = urls[index];
      if(url) {
        //update
        result = await this.UpdateEntitiesFromUrl(url,type);
        if(result.Status==StatusResult.Error) {
          this.FireChangedState({
            message:result,
            logLevel:LogLevel.Debug,
            increment:undefined
          });
        }
        //
      }else break;
      index++;
    }while(true)
    //result
    result= new IotResult(StatusResult.Ok,`Update of ${type} ${this._entityIntLabel}s completed successfully`);
    return Promise.resolve(result);
  }

  protected async LoadEntities(type:EntityType):Promise<void>
  {
    this.FireChangedState({
      message:`☑️ Loading ${type} ${this._entityIntLabel}s`,
      logLevel:LogLevel.Debug,
      increment:undefined
    });
    const path=`${this.Config.baseStoragePath}\\${type}`;
    const result = await this.LoadFromFolder(path,type);
    this.FireChangedState({
      message:result,
      logLevel:LogLevel.Debug,
      increment:undefined
    });
  }

  public async LoadEntitiesAll(force:boolean=false)
  {
    //main code
    this.FireChangedState({
      message:`Preparing to load`,
      logLevel:undefined,
      increment:20 //20
    });
    //Preparing
    let result= new IotResult(StatusResult.None);
    this.Clear();
    let url:string="";
    if(this.Config.extMode==vscode.ExtensionMode.Production)
    {
      url="https://raw.githubusercontent.com/devdotnetorg/vscode-extension-dotnet-fastiot/master/templates/system/templatelist.fastiot.yaml";
    }else {
      //for test
      url="https://raw.githubusercontent.com/devdotnetorg/vscode-extension-dotnet-fastiot/dev/templates/system/templatelist.fastiot.yaml";
    }
    this.FireChangedState({
      message:`-------- Loading ${this._entityIntLabel}s -------`,
      logLevel:LogLevel.Information,
      increment:undefined
    });
    //Loading system entities
    this.FireChangedState({
      message:`Loading system ${this._entityIntLabel}s`,
      logLevel:undefined,
      increment:20 //40
    });
    await this.LoadEntities(EntityType.system);
    //Updating system entities
    this.FireChangedState({
      message:`Updating ${this._entityIntLabel}s`,
      logLevel:undefined,
      increment:20 //60
    });
    //To get the number of hours since Unix epoch, i.e. Unix timestamp:
    const dateNow=Math.floor(Date.now() / 1000/ 3600);
    const TimeHasPassedHours=dateNow-this.Config.builtInConfig.LastUpdateTemplatesHours;
    this.FireChangedState({
      message:`📥 Updating ${this._entityIntLabel}s:`,
      logLevel:LogLevel.Debug,
      increment:undefined
    });
    if(force||(this.Config.isUpdate&&(TimeHasPassedHours>=this.Config.updateIntervalHours))){
      //system
      this.FireChangedState({
        message:`☑️ Updating system ${this._entityIntLabel}s`,
        logLevel:LogLevel.Debug,
        increment:undefined
      });
      result=await this.UpdateEntitiesFromUrl(url,EntityType.system);
      this.FireChangedState({
        message:result,
        logLevel:LogLevel.Debug,
        increment:undefined
      });
      //timestamp of last update
      if(result.Status==StatusResult.Ok){
        this.Config.builtInConfig.LastUpdateTemplatesHours=<number>dateNow;
        this.Config.builtInConfig.Save();
      }
      //community
      this.FireChangedState({
        message:`☑️ Updating community ${this._entityIntLabel}s`,
        logLevel:LogLevel.Debug,
        increment:undefined
      });
      result=await this.UpdateEntitiesFromUrls(this.Config.listSourceUpdateEntitiesCommunity,EntityType.community);
      this.FireChangedState({
        message:result,
        logLevel:LogLevel.Debug,
        increment:undefined
      });
    } else {
      this.FireChangedState({
        message:`Disabled or less than ${this.Config.updateIntervalHours} hour(s) have passed since the last update.`,
        logLevel:LogLevel.Debug,
        increment:undefined
      });
    }
    //Loading custom entities
    this.FireChangedState({
      message:`Loading custom ${this._entityIntLabel}s`,
      logLevel:undefined,
      increment:20 //80
    });
    await this.LoadEntities(EntityType.user);
    const endMsg=`📚 ${this.Count} ${this._entityIntLabel}(s) available.`;
    this.FireChangedState({
      message:endMsg,
      logLevel:LogLevel.Information,
      increment:undefined
    });
    this.FireChangedState({
      message:`----------------------------------`,
      logLevel:LogLevel.Information,
      increment:undefined
    });
    this.FireChangedState({
      message:`${this._entityIntLabel}s loaded`,
      logLevel:undefined,
      increment:20 //100
    });
    //end
  }

  public RestoreSystemEntities(force=false)
  {
    //clear
    const dir=`${this.Config.baseStoragePath}\\${EntityType.system}`;
    if (fs.existsSync(dir))
      fs.emptyDirSync(dir);
    this.LoadEntitiesAll(force);
  }
}

export interface IChangedStateEvent {
  message?:string|IotResult,
  logLevel?:LogLevel,
  increment?:number
}

export interface IConfigEntityCollection {
  baseStoragePath:string;
  extVersion: string;
  extMode: vscode.ExtensionMode;
  recoverySourcePath: string;
  schemasFolderPath: string;
  tempFolderPath:string;
  builtInConfig:IotBuiltInConfig;
  isUpdate:boolean;
  updateIntervalHours:number;
  listSourceUpdateEntitiesCommunity:string[];
}

export enum ContainsType {
	no = "no",
	yesSameVersion  = "yes same version",
	yesMoreVersion = "yes more version",
	yesVersionSmaller = "yes version smaller"
}
