import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import YAML from 'yaml';
import axios from 'axios';
import { IotResult,StatusResult } from '../IotResult';
import { IoTHelper } from '../Helper/IoTHelper';
import { networkHelper } from '../Helper/networkHelper';

export class EntityDownloader {
  constructor(
    ){}

  public async DownloadEntity(item:EntityDownload,destPath:string):Promise<IotResult>
  {
    let result:IotResult;
    try {
      //download *.zip
      const fileZipPath=`${destPath}\\${item.Id}.zip`;
      if (fs.existsSync(fileZipPath)) fs.removeSync(fileZipPath);
      await networkHelper.DownloadFileHttp(item.Url,fileZipPath);
      //unpack
      let unpackPath=`${destPath}\\${item.Id}`;
      //delete
      if (fs.existsSync(unpackPath))
      {
        fs.emptyDirSync(unpackPath);
        fs.removeSync(unpackPath);
      }
      var AdmZip = require("adm-zip");
      var zip = new AdmZip(fileZipPath);
      // extracts everything
      zip.extractAllTo(/*target path*/ unpackPath, /*overwrite*/ true);
      //delete zip
      fs.removeSync(fileZipPath);
      result = new IotResult(StatusResult.Ok,undefined,undefined);
      result.returnObject=unpackPath;
    } catch (err: any){
      result = new IotResult(StatusResult.Error,`Unable to download file ${item.Url}.`,err);
    }
    //result
    return Promise.resolve(result);
  }

  public async GetDownloadListEntity(url:string):Promise<IotResult>
  {
    let result:IotResult;
    let listDownload:Array<EntityDownload>=[];
    try {
      //download templatelist.fastiot.yaml
      const response = await axios.get(url);
      if(response.status!=200){
        result = new IotResult(StatusResult.Error,`Unable to download file ${url}. Server response http code ${response.status}`,`${response.statusText}`);
        return Promise.resolve(result);
      }
      //parse templatelist.fastiot.yaml
      const obj=YAML.parse(response.data); 
      //entity download
      let index=0; 
      do { 				
            let item=obj.entitys[index];
            if(item) {
              const downloadEntity=this.ParseEntityDownload(item,url);
              listDownload.push(downloadEntity);
              //next position
              index=index+1;
            }else break;
          }  
      while(true)
    } catch (err: any){
        result = new IotResult(StatusResult.Error,`Unable to download file ${url}.`,err);
        return Promise.resolve(result);
    }
    //result
    result = new IotResult(StatusResult.Ok,undefined,undefined);
    result.returnObject=listDownload;
    return Promise.resolve(result);
  }

  protected ParseEntityDownload(obj:any,url:string):EntityDownload
  {
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
    const downloadEntity=new EntityDownload(objId,objVersion,objUrl,
        objforVersionExt,platform);
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
