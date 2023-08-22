import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IoT } from '../Types/Enums';
import LogLevel = IoT.Enums.LogLevel;
import { ArgumentsCommandCli } from './ArgumentsCommandCli';
import { TaskBase } from './TaskBase';

export class TaskGetFile extends TaskBase  {
  private _filePath:string;
  public get FilePath(): string {
    return this._filePath;}

  constructor(label:string,
    filePath:string,funcNameParseData:string,
    isPossibleToSkip?:boolean, errorMessage?: string
    ){
      super(label,funcNameParseData,isPossibleToSkip,errorMessage);
      //
      this._filePath=filePath;
    }
 }
  