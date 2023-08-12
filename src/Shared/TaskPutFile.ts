import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IoT } from '../Types/Enums';
import LogLevel = IoT.Enums.LogLevel;
import { ArgumentsCommandCli } from './ArgumentsCommandCli';
import { TaskBase } from './TaskBase';

export class TaskPutFile extends TaskBase  {
  private _destFilePath:string;
  public get DestFilePath(): string {
    return this._destFilePath;}
  private _dataFile:string;
  public get DataFile(): string {
    return this._dataFile;}
  private _fileType?:string;
  public get FileType(): string| undefined {
    return this._fileType;}

  constructor(label:string,
    destFilePath:string, dataFile:string, fileType?:string,
    isPossibleToSkip?:boolean, errorMessage?: string
    ){
      super(label,undefined,isPossibleToSkip,errorMessage);
      //
      this._destFilePath=destFilePath;
      this._dataFile=dataFile;
      this._fileType=fileType;
    }
 }
  