import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {IotDevice} from '../IotDevice';
import {IoTDTO} from './IoTDTO';
import { IotResult,StatusResult } from '../IotResult';

export interface IDtoAdapter {  
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