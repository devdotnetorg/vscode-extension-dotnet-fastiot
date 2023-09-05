import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IotDevice } from '../IotDevice';
import { DTO_d } from './DTO_d';
import { IotResult,StatusResult } from '../Shared/IotResult';

export interface IDtoAdapter_d {  
  readonly Device:IotDevice;  
  ReadConfig(jsonObj:any):void;
  WriteConfig():any;
  //  
  GetAll(): Promise<IotResult>;
  Put(fileName:string, fileData:string,fileType:string):Promise<IotResult>;
  Delete(FsPath:string):Promise<IotResult>;
  Enable(FsPath:string):Promise<IotResult>;
	Disable(FsPath:string):Promise<IotResult>;
}