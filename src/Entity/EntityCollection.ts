import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import { compare } from 'compare-versions';
import { EntityBase } from './EntityBase';
import { EntityBaseAttribute } from './EntityBaseAttribute';
import { EntityType } from './EntityType';
import { EntityRecovery } from './EntityRecovery';
import { IotResult,StatusResult } from '../IotResult';
import { LogLevel } from '../shared/LogLevel';
import { IoTHelper } from '../Helper/IoTHelper';
import { EntityDownload, EntityDownloader } from './EntityDownloader';
import { IotBuiltInConfig } from '../Configuration/IotBuiltInConfig';
import { ClassWithEvent } from '../Shared/ClassWithEvent';
import { ContainsType } from '../Shared/ContainsType';

export abstract class EntityCollection <A extends EntityBaseAttribute, T extends EntityBase<A>> extends ClassWithEvent {
  
  protected _items:Map<string,T>;
  protected readonly _entityLabel:string; //for understandable log
  protected readonly _entitiesLabel:string; //for understandable log
  private readonly TCreator: new(pathFolderSchemas: string) => T;
  protected readonly Config:IConfigEntityCollection;
  protected GetDirEntitiesCallback:(type:EntityType) =>string;

  public get Count(): number {
      return this._items.size;}

  constructor(
    entityLabel:string, entitiesLabel:string, TCreator: new(pathFolderSchemas: string) => T,
    getDirEntitiesCallback:(type:EntityType) =>string, config:IConfigEntityCollection
    ){
      super();
      this._items = new Map<string,T>(); 
      this._entityLabel=entityLabel;
      this._entitiesLabel=entitiesLabel;
      this.TCreator=TCreator;
      this.GetDirEntitiesCallback=getDirEntitiesCallback;
      this.Config=config;
    }

  public Add(value:T):boolean
  {
    try {
      //unique label
      if(!this.isUniqueLabel(value.Attributes.Label)) {
        value.Attributes.Label=`[${value.Attributes.Id}] ${value.Attributes.Label}`;
      }
      this._items.set(value.Attributes.Id,value);
      return true;
    } catch (err: any){
      return false;
    }
  }

  public Remove(id:string):boolean
  {
    return this._items.delete(id);
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
    try {
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
        result=new IotResult(StatusResult.Ok,`No ${type} ${this._entitiesLabel} to load. ${pathFolder} folder is empty`,undefined,LogLevel.Debug);
        return Promise.resolve(result);
      }
      //checking all folders
      listFolders.forEach(dir => {
        const filePath=`${dir}\\${this._entityLabel.toLowerCase()}.fastiot.yaml`;
        let entity = new this.TCreator(this.Config.schemasFolderPath);
        entity.Init(type,filePath,this.Config.recoverySourcePath);
        if(!entity.IsValid&&type==EntityType.system) {
          //Recovery
          this.CreateEvent(`${this._entityLabel} recovery: ${path.dirname(filePath)}`,LogLevel.Debug);
          result= entity.Recovery();
          if(result.Status==StatusResult.Ok) {
            entity.Init(type,filePath,this.Config.recoverySourcePath);}
            else {
              this.CreateEvent(result,LogLevel.Debug);
            }
        }
        //main
        if(entity.IsValid) {
          this.CreateEvent(`${this._entityLabel} is valid: [${entity.Attributes.Id}]`,LogLevel.Debug);
          if(this.IsCompatibleByVersionExtAndPlatform(entity)) {
            const isContains=this.Contains(entity);
            switch(isContains) { 
              case ContainsType.no: {
                this.Add(entity);
                this.CreateEvent(`${this._entityLabel} added: [${entity.Attributes.Id}] ${entity.RootDir}`,LogLevel.Debug);
                break; 
              } 
              case ContainsType.yesVersionSmaller: {
                this.Update(entity);
                this.CreateEvent(`${this._entityLabel} updated: [${entity.Attributes.Id}] ${entity.RootDir}`,LogLevel.Debug);
                break; 
              }
              default: {
                this.CreateEvent(`Adding a ${this._entityLabel} was skipped because already in the collection: [${entity.Attributes.Id}] ${entity.RootDir}`,LogLevel.Debug);
                break; 
              } 
            }
          }else{
            result = new IotResult(StatusResult.Error,`The ${this._entityLabel} ${entity.RootDir} is for a newer version of the extension. ` +
              `Update the extension.`);
            this.CreateEvent(result);
          }
        }else{
          result = new IotResult(StatusResult.Error,`The ${this._entityLabel} ${entity.RootDir} has not been validated.`);
          this.CreateEvent(result);
          this.CreateEvent(entity.ValidationErrorsToString,LogLevel.Debug);
          //delete system entity
          if(type==EntityType.system) {
            result= entity.Remove();
            this.CreateEvent(result,LogLevel.Debug);
          }
        }
      });
      //result
      if((this.Count-entitysCountBegin)>0) {
        result= new IotResult(StatusResult.Ok,`Loading ${type} ${this._entitiesLabel} from ${pathFolder} folder successfully completed`);
        result.logLevel=LogLevel.Debug;
      }else{
        result= new IotResult(StatusResult.Ok,`No ${type} ${this._entityLabel} was loaded from the ${pathFolder} folder`);
        result.logLevel=LogLevel.Debug;
      }
    } catch (err: any){
      result= new IotResult(StatusResult.Error,`Error loading ${type} ${this._entitiesLabel}`,err);
    }
    return Promise.resolve(result);
  }

  protected async UpdateEntitiesFromUrl(url:string,type:EntityType):Promise<IotResult>
  {
    const destPath= this.GetDirEntitiesCallback(type);
    let downloader = new EntityDownloader();
    let result:IotResult;
    this.CreateEvent(`🔗 Downloading a list of ${this._entitiesLabel} to update: ${url}`,LogLevel.Debug);
    result= await downloader.GetDownloadListEntity(url);
    if(result.Status==StatusResult.Error) {
      result.AddMessage(`Error updating ${type} ${this._entitiesLabel}`);
      return Promise.resolve(result);
    }
    this.CreateEvent(`🔗 List of ${this._entitiesLabel} loaded ${url}`,LogLevel.Debug);
    let listDownload:Array<EntityDownload>=result.returnObject;
    if(listDownload.length==0) {
      result= new IotResult(StatusResult.Ok,`Url: ${url}. No ${this._entitiesLabel} to download`);
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
                  const filePath = path.join(unpackPath, `${this._entityLabel.toLowerCase()}.fastiot.yaml`);
                  let entity= new this.TCreator(this.Config.schemasFolderPath);
                  entity.Init(EntityType.system,filePath);
                  if(entity.IsValid) {
                    result=entity.Move(path.join(destPath, entity.Attributes.Id));
                    if(result.Status==StatusResult.Error) {
                      this.CreateEvent(result,LogLevel.Debug);
                      break;
                    } 
                    this.Add(entity);
                    this.CreateEvent(`${this._entityLabel} added/updated: [${entity.Attributes.Id}] ${entity.RootDir}`,LogLevel.Debug);
                  } else {
                    result = new IotResult(StatusResult.Error,`The  ${this._entityLabel} ${entity.YAMLFilePath} has not been validated`)
                    this.CreateEvent(result,LogLevel.Debug);
                    this.CreateEvent(entity.ValidationErrorsToString,LogLevel.Debug);
                  }
                }
                break; 
              }
              case ContainsType.yesVersionSmaller: {
                result= await downloader.DownloadEntity(item,this.Config.tempFolderPath);
                if(result.Status==StatusResult.Ok) {
                  const unpackPath= <string> result.returnObject;
                  const filePath = path.join(unpackPath, ` ${this._entityLabel.toLowerCase()}.fastiot.yaml`);
                  let entity= new this.TCreator(this.Config.schemasFolderPath);
                  entity.Init(EntityType.system,filePath);
                  if(entity.IsValid) {
                    result=entity.Move(path.join(destPath, entity.Attributes.Id));
                    if(result.Status==StatusResult.Error) {
                      this.CreateEvent(result,LogLevel.Debug);
                      break;
                    } 
                    this.Update(entity);
                    this.CreateEvent(`${this._entityLabel} added/updated: [${entity.Attributes.Id}] ${entity.RootDir}`,LogLevel.Debug);
                  } else {
                    result = new IotResult(StatusResult.Error,`The  ${this._entityLabel} ${entity.YAMLFilePath} has not been validated`)
                    this.CreateEvent(result,LogLevel.Debug);
                    this.CreateEvent(entity.ValidationErrorsToString,LogLevel.Debug);
                  }
                }
              }
              default: { 
                //statements; 
                break; 
              } 
            }
        }else{
          result = new IotResult(StatusResult.Error,`Error. The ${this._entityLabel} ${item.Url} is for a newer version of the extension. ` +
          `Update the extension.`);
          this.CreateEvent(result,LogLevel.Debug);
        }
        //
      }else break;      
      index++;
    }while(true)
    //result
    result= new IotResult(StatusResult.Ok,`Update of ${type} ${this._entitiesLabel} completed successfully`,undefined,LogLevel.Debug);
    return Promise.resolve(result);
  }

  protected async UpdateEntitiesFromUrls(urls:string[],type:EntityType):Promise<IotResult>
  {
    let result:IotResult;
    //Check urls
    if(urls.length==0) {
      result= new IotResult(StatusResult.No,`No update sources for community  ${this._entitiesLabel}`);
      return Promise.resolve(result);
    }
    //list
    let index:number=0;
    do{
      const url = urls[index];
      if(url) {
        //update
        result = await this.UpdateEntitiesFromUrl(url,type);
        if(result.Status==StatusResult.Error)
          this.CreateEvent(result,LogLevel.Debug);
      }else break;
      index++;
    }while(true)
    //result
    result= new IotResult(StatusResult.Ok,`Update of ${type} ${this._entitiesLabel} completed successfully`,undefined,LogLevel.Debug);
    return Promise.resolve(result);
  }

  protected async LoadEntities(type:EntityType):Promise<void>
  {
    this.CreateEvent(`☑️ Loading ${type} ${this._entitiesLabel}`,LogLevel.Debug);
    const path=this.GetDirEntitiesCallback(type);
    const result = await this.LoadFromFolder(path,type);
    this.CreateEvent(result,LogLevel.Debug);
  }

  public async LoadEntitiesAll(force:boolean=false)
  {
    let result:IotResult;
    try {
      //Preparing
      result= new IotResult(StatusResult.None);
      this.Clear();
      //To get the number of hours since Unix epoch, i.e. Unix timestamp:
      const dateNow=Math.floor(Date.now() / 1000/ 3600);
      const TimeHasPassedHours=dateNow-this.Config.builtInConfig.LastUpdateTemplatesHours;
      const isNeedUpdate = ()=>this.Config.isUpdate&&(TimeHasPassedHours>=this.Config.updateIntervalHours);
      //main code
      this.CreateEvent(`-------- Loading ${this._entitiesLabel} -------`,
        LogLevel.Information);
      //Loading system entities
      this.CreateEvent(`Loading system ${this._entitiesLabel}`,undefined,15); //15
      await this.LoadEntities(EntityType.system);
      //Updating system entities
      this.CreateEvent(`Updating system ${this._entitiesLabel}`,undefined,15); //30
      if(force||isNeedUpdate()){
        //system
        this.CreateEvent(`☑️ Updating system ${this._entitiesLabel}`,LogLevel.Debug);
        result=await this.UpdateEntitiesFromUrl(this.Config.urlUpdateEntitiesSystem,EntityType.system);
        this.CreateEvent(result,LogLevel.Debug);
        //timestamp of last update
        if(result.Status==StatusResult.Ok){
          this.Config.builtInConfig.LastUpdateTemplatesHours=<number>dateNow;
          this.Config.builtInConfig.Save();
        }
      } else {
        this.CreateEvent(`📥 ${this._entityLabel} update: disabled or less than ${this.Config.updateIntervalHours} hour(s) have passed since the last update.`,LogLevel.Debug);
      }
      //Loading community entities
      this.CreateEvent(`Loading community ${this._entitiesLabel}`,undefined,15); //45
      await this.LoadEntities(EntityType.community);
      //Updating community entities
      this.CreateEvent(`Updating community ${this._entitiesLabel}`,undefined,15); //60
      if(force||isNeedUpdate()){
        //community
        this.CreateEvent(`☑️ Updating community ${this._entitiesLabel}`,LogLevel.Debug);
        result=await this.UpdateEntitiesFromUrls(this.Config.urlsUpdateEntitiesCommunity,EntityType.community);
        this.CreateEvent(result,LogLevel.Debug);
        //timestamp of last update
        if(result.Status==StatusResult.Ok){
          this.Config.builtInConfig.LastUpdateTemplatesHours=<number>dateNow;
          this.Config.builtInConfig.Save();
        }
      }
      //Loading custom entities
      this.CreateEvent(`Loading custom ${this._entitiesLabel}  templates loaded `,undefined,15); //75
      await this.LoadEntities(EntityType.user);
      //result
      this.CreateEvent(new IotResult(StatusResult.Ok, `${this._entitiesLabel} loaded`));
      const endMsg=`📚 ${this.Count} ${this._entityLabel}(s) available.`;
      this.CreateEvent(endMsg,LogLevel.Information);
      this.CreateEvent(`----------------------------------`,LogLevel.Information);
      this.CreateEvent(`${this._entitiesLabel} loaded`,undefined,15); //90
    } catch (err: any){
      result= new IotResult(StatusResult.Error, `Error loading ${this._entityLabel} collection`,err); 
      this.CreateEvent(result,LogLevel.Information);
    }
  }

  public DeletingSystemEntities()
  {
    //clear
    const dir=this.GetDirEntitiesCallback(EntityType.system);
    if (fs.existsSync(dir)) fs.emptyDirSync(dir);
  }

  private isUniqueLabel(searchLabel:string):boolean
  {
    searchLabel=searchLabel.toLocaleLowerCase();
    for (let [key, value] of this._items.entries()) {
      if (value.Attributes.Label.toLocaleLowerCase() === searchLabel)
        return false;
    }
    return true;
  }

}

//TODO убрать, заменить на Interface IConfig

export interface IConfigEntityCollection {
  extVersion: string;
  extMode: vscode.ExtensionMode;
  recoverySourcePath: string;
  schemasFolderPath: string;
  tempFolderPath:string;
  builtInConfig:IotBuiltInConfig;
  isUpdate:boolean;
  updateIntervalHours:number;
  urlsUpdateEntitiesCommunity:string[];
  urlUpdateEntitiesSystem:string;
}
