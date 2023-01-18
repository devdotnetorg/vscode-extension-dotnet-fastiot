import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {compare} from 'compare-versions';
import {EntityBase} from './EntityBase';
import {EntityBaseAttribute} from './EntityBaseAttribute';
import {EntityType} from './EntityType';
import {IotResult,StatusResult } from '../IotResult';

export abstract class EntityCollection <A extends EntityBaseAttribute, T extends EntityBase<A>> {
  private _data:Map<string,T>;

  private _versionExt:string;  
  public get VersionExt(): string {
    return this._versionExt;}

  private _basePath:string;  
  public get BasePath(): string {
    return this._basePath;}
  private _recoverySourcePath:string;  
  public get RecoverySourcePath(): string {
    return this._recoverySourcePath;}

  public get Count(): number {
      return this._data.size;}

  protected LogCallback:(value:string) =>void;

  constructor(basePath: string, recoverySourcePath:string,logCallback:(value:string) =>void,versionExt:string
    ){
      this.LogCallback=logCallback;
      this._data = new Map<string,T>(); 
      this._basePath=basePath;
      this._recoverySourcePath=recoverySourcePath;
      this._versionExt = versionExt;
    }

  public Add(id:string,value:T):boolean
  {
    try {
      this._data.set(id,value);
      return true;
    } catch (err: any){
      return false;
    }
  }

  public Remove(id:string):boolean
  {
    try {
      this._data.delete(id);
      return true;
    } catch (err: any){
      return false;
    }
  }

  public Update(id:string,newValue:T):boolean
  {
    this.Remove(id);
    return this.Add(id,newValue);
  }

  public Clear()
  {
    this._data.clear();
  }

  public IsCompatible1(value:T):boolean
  {
    const forVersionExt=value.Attributes.ForVersionExt;
    const platform = value.Attributes.platform;
    return this.IsCompatible2(forVersionExt,platform);
  }

  public IsCompatible2(forVersionExt:string,platform:Array<string>):boolean
  {
    const currentVersionExt=this.VersionExt;
    const isCompatibleVersion=compare(`${currentVersionExt}`,`${forVersionExt}`, '>=');
    const currentPlatform=process.platform.toString();
    const foundPlatform = platform.find(element => element == currentPlatform);
    let isCompatiblePlatform=false;
    if(foundPlatform) isCompatiblePlatform=true;
    return (isCompatibleVersion&&isCompatiblePlatform);
    //if(isCompatibleVersion&&isCompatiblePlatform) return true; else return false;
  }

  public Contains1(value:T):ContainsType
  {
    return this.Contains2(value.Attributes.Id,value.Type,value.Attributes.Version);
  }

  public Contains2(id:string,type:EntityType,version:string):ContainsType
  {
    // type:EntityType, version:string
    if(!this._data.has(id)) return ContainsType.no;
    let element=this._data.get(id);
    const result=element?.Compare2(type,version);
    //0 - equal, 1 - entityBase up, -1 - entityBase down
    if(result==0)
    {
      return ContainsType.yesSameVersion;
    }else if (result==1) return ContainsType.yesVersionSmaller;
    return ContainsType.yesMoreVersion;
  }

  protected GetListDirWithEntity(path:string):string[]
  {
    let listFolders:Array<string>=[];
    //getting a list of entity directories
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
    return listFolders;
  }

  protected abstract LoadFromFolder(path:string, type:EntityType,recoverySourcePath:string|undefined):Promise<IotResult>

  public Select(endDeviceArchitecture:string|undefined):Array<T>
  {
    let listEntitys:Array<T>=[];
    this._data.forEach(entiny => {
      //Entiny
      let found=entiny.Attributes.EndDeviceArchitecture.find(value=>value==endDeviceArchitecture);
      if(found) listEntitys.push(entiny);
      });
    return listEntitys;
  }
}

export enum ContainsType {
	no = "no",
	yesSameVersion  = "yes same version",
	yesMoreVersion = "yes more version",
	yesVersionSmaller = "yes version smaller"
}
