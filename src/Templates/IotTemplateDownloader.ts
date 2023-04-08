import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { EntityDownloader,EntityDownload } from '../Entity/EntityDownloader';
import { IotResult,StatusResult } from '../IotResult';

export class IotTemplateDownloader extends EntityDownloader {

  constructor(
    ){
      super();
  }

  public async DownloadTemplate(item:EntityDownload,destPath:string):Promise<IotResult>
  {
    const result=await super.DownloadEntity(item,destPath);
    //result
    return Promise.resolve(result);
  }

  public async GetDownloadListTemplate(url:string):Promise<IotResult>
  {
    const result=await super.GetDownloadListEntity(url);
    //result
    return Promise.resolve(result);
  }

}
