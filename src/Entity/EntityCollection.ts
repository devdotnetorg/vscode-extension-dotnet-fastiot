import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {EntityBase} from './EntityBase';
import {EntityBaseAttribute} from './EntityBaseAttribute';
import {EntityType} from './EntityType';
import {IotResult,StatusResult } from '../IotResult';

export abstract class EntityCollection <A extends EntityBaseAttribute, T extends EntityBase<A>> {
  private _data:Map<string,T>;
  constructor(
    ){
      this._data = new Map<string,T>();  
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

  public LoadFromFolder(path:string,nameFile:string, type:EntityType):IotResult
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


    //
  }
}

export enum ContainsType {
	no = "no",
	yesSameVersion  = "yes same version",
	yesMoreVersion = "yes more version",
	yesVersionSmaller = "yes version smaller"
}
