import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import YAML from 'yaml';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IoTHelper } from '../Helper/IoTHelper';
import { networkHelper } from '../Helper/networkHelper';
import { YamlValidatorFork } from '../Validator/YamlValidatorFork';
import { IYamlValidator } from '../Validator/IYamlValidator';

export class EntityDownloader {
  protected readonly _pathFolderSchema;
  constructor(pathFolderSchema: string){
    this._pathFolderSchema=pathFolderSchema;

  }

  public async DownloadEntity(item:EntityDownload,destPath:string):Promise<IotResult>
  {
    let result:IotResult;
    try {
      //download *.zip
      const fileZipPath = path.join(destPath, `${item.Id}.zip`);
      result=await networkHelper.DownloadFileHttp(item.Url,fileZipPath);
      if(result.Status!=StatusResult.Ok) return Promise.resolve(result);
      result.returnObject=fileZipPath;
    } catch (err: any){
      result = new IotResult(StatusResult.Error,`Unable to download file ${item.Url}.`,err);
    }
    //result
    return Promise.resolve(result);
  }

  public async GetDownloadListEntities(url:string):Promise<IotResult>
  {
    let result:IotResult;
    const errMsg=`Error loading entity list ${url}`;
    try {
      //download templatelist.fastiot.yaml
      result=await networkHelper.DownloadFileHttp(url);
      if(result.Status!=StatusResult.Ok) {
        result.AddMessage(errMsg);
        return Promise.resolve(result);
      }
      let listEntities=<string>result.returnObject;
      //validate
      let yamlValidator:IYamlValidator=new YamlValidatorFork(this._pathFolderSchema);
      const yamlObj=YAML.parse(listEntities);
      const schemaFileName="templatelist.fastiot.schema.validator-fork.yaml";
      result = yamlValidator.ValidateObjBySchema(yamlObj,schemaFileName);
      if(result.Status!=StatusResult.Ok) {
        result.AddMessage(errMsg);
        return Promise.resolve(result);
      }
      const validationErrors=<Array<string>>result.returnObject;
      if(validationErrors.length>0) {
        result = new IotResult(StatusResult.Error,`File validation error ${url}. schemaFileName = ${schemaFileName}`);
        result.AddMessage(IoTHelper.ValidationErrorsToString(validationErrors));
        return Promise.resolve(result);
      }
      //parse
      result = await this.ParseDownloadListEntities(yamlObj,url);
      result.AddMessage("Got a list of entities to update");
    } catch (err: any){
      result = new IotResult(StatusResult.Error,`File parsing error ${url}.`,err);
    }
    //result
    return Promise.resolve(result);
  }

  protected async ParseDownloadListEntities(yamlObj:any,url:string):Promise<IotResult>
  {
    let result:IotResult;
    let listDownload:Array<EntityDownload>=[];
    try {
      //YamlValidator
      //parse templatelist.fastiot.yaml
      let index=0; 
      do { 				
            let item=yamlObj.entities[index];
            if(item) {
              const downloadEntity=this.ParseEntityDownload(item,url);
              if (downloadEntity) listDownload.push(downloadEntity);
              //next position
              index=index+1;
            }else break;
          }  
      while(true)
    } catch (err: any){
        result = new IotResult(StatusResult.Error,`File parsing error ${url}.`,err);
        return Promise.resolve(result);
    }
    //result
    result = new IotResult(StatusResult.Ok);
    result.returnObject=listDownload;
    return Promise.resolve(result);
  }

  protected ParseEntityDownload(obj:any,url:string):EntityDownload|undefined
  {
    let downloadEntity:EntityDownload|undefined;
    try {
      const objId=obj.id;
      const objVersion=obj.version;
      const objforVersionExt=obj.forVersionExt;
      const objUrl=url.substring(0,url.lastIndexOf('/'))+"/"+objId+".zip";
      //const filename = uri.split('/').pop()?.substring(0,uri.split('/').pop()?.lastIndexOf('.'));
      //const fileZipPath=this._config.Folder.Temp+"\\"+filename+".zip";
      //arrays
      let platform:Array<string>=[];  
      let index=0; 
      //platform
      index=0;
      do { 				
            let item=obj.platform[index];
            if(item) {
              platform.push(<string>item);            
              //next position
              index=index+1;
            }else break;      
      } 
      while(true)
      downloadEntity=new EntityDownload(objId,objVersion,objUrl,
          objforVersionExt,platform);
    } catch (err: any){}
    //result
    return downloadEntity;
  }
}

export class EntityDownload {  
  private _id: string;  
  public get Id(): string {
    return this._id;}

  private _version: string;  
  public get Version(): string {
    return this._version;}

  private _url: string;  
  public get Url(): string {
    return this._url;}
  private _forVersionExt:string;  
  public get ForVersionExt(): string {
    return this._forVersionExt;}
  private _platform:Array<string>=[];  
  public get platform(): Array<string> {
    return this._platform;}
  
  constructor(
    id:string,
    version:string,
    url:string,
    forVersionExt:string,
    platform:Array<string>
    ){
      this._id=id;
      this._version=version;
      this._url=url;
      this._forVersionExt=forVersionExt;
      this._platform=platform;
    }
 }
