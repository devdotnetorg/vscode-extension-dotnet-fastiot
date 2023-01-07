import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';

import * as stream from 'stream';
import {promisify} from 'util';

import axios from 'axios';
import YAML from 'yaml';
import StreamZip from 'node-stream-zip';

import {IotResult,StatusResult} from '../IotResult';

export abstract class EntityDownloader {
  constructor(
    ){}

  private async DownloadEntity(item:EntityDownload,destPath:string):Promise<IotResult>
  {
    let result:IotResult;
    try {
      //download *.zip
      const fileZipPath=`destPath\\${item.Id}.zip`;
      if (fs.existsSync(fileZipPath)) fs.removeSync(fileZipPath);
      await downloadFile(item.Url,fileZipPath);
      //unpack
      let unpackPath=`destPath\\${item.Id}`;
      const zip = new StreamZip.async({ file: fileZipPath });
      const count = await zip.extract(null, unpackPath);
      console.log(`Extracted ${count} entries`);
      await zip.close();
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

  private async GetDownloadListEntity(url:string):Promise<IotResult>
  {
    let result:IotResult;
    let listDownload:Array<EntityDownload>=[];
    try {
      //download templatelist.fastiot.yaml
      const response = await axios.get(url);
      if(response.status!=200){
        result = new IotResult(StatusResult.Error,`Unable to download file ${url}. Server response http code ${response.status}`,undefined);
        return Promise.resolve(result);
      }
      //parse templatelist.fastiot.yaml
      const obj=YAML.parse(response.data); 
      //template download
      let index=0; 
      do { 				
            let item=obj.templates[index];
            if(item) {
              const itemId=item.id;
              const itemVersion=item.version;
              const itemUrl=url.substring(0,url.lastIndexOf('/'))+"/"+itemId+".zip";
              //const filename = uri.split('/').pop()?.substring(0,uri.split('/').pop()?.lastIndexOf('.'));
              //const fileZipPath=this._config.Folder.Temp+"\\"+filename+".zip";
              const downloadTemplate=new EntityDownload(
                  itemId,itemVersion,itemUrl);
              listDownload.push(downloadTemplate);
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
  constructor(
    id:string,
    version:string,
    url:string,
    ){
      this._id=id;
      this._version=version;
      this._url=url;
    }
 }

const finished = promisify(stream.finished);

export async function downloadFile(fileUrl: string, outputLocationPath: string): Promise<any> {
  const writer = fs.createWriteStream(outputLocationPath);
  return axios({
    method: 'get',
    url: fileUrl,
    responseType: 'stream',
  }).then(response => {
    response.data.pipe(writer);
    return finished(writer); //this is a Promise
  });
}
