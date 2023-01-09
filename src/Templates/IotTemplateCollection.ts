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

export class IotTemplateCollection extends EntityCollection<IotTemplateAttribute,IotTemplate> {

  constructor(
    ){
      super();  
  }

  public async LoadFromFolder(path:string, type:EntityType,recoverySourcePath:string|undefined):Promise<IotResult>
  {
    let result= new IotResult(StatusResult.None,undefined,undefined);
    //Recovery

    //
    const listFolders=this.GetListDirWithEntity(path);
    //ckeck
    if (listFolders.length==0)
    {
      result=new IotResult(StatusResult.Error,`${path} folder is empty`,undefined);
      return Promise.resolve(result);
    }
    //checking all folders
    listFolders.forEach(dir => {
      const filePath=`${dir}\\template.fastiot.yaml`;
      let template = new IotTemplate();
      template.Init(type,filePath,recoverySourcePath);
      if(!template.IsValid&&type==EntityType.system)
      {
        //Recovery

      }
      //main
      if(template.IsValid)
      {
        const isContains=this.Contains1(template);
        //
        switch(isContains) { 
          case ContainsType.no: {
            this.Add(template.Attributes.Id,template);
            break; 
          } 
          case ContainsType.yesVersionSmaller: {
            this.Update(template.Attributes.Id,template);
            break; 
          }
          default: { 
             //statements; 
             break; 
          } 
        }
      }else{
        result.AppendResult(new IotResult(StatusResult.Error,undefined,template.ValidationErrors.toString()));
      }
    });
    //result
    return Promise.resolve(result);
  }


}


