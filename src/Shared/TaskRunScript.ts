import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IoT } from '../Types/Enums';
import LogLevel = IoT.Enums.LogLevel;
import { ArgumentsCommandCli } from './ArgumentsCommandCli';
import { TaskBase } from './TaskBase';

export class TaskRunScript extends TaskBase {
  private _normalModeFileNameScript:string;
  public get NormalModeFileNameScript(): string {
    return this._normalModeFileNameScript;}
  private _normalModeArgumentScript?:ArgumentsCommandCli;
  public get NormalModeArgumentScript(): ArgumentsCommandCli| undefined {
    return this._normalModeArgumentScript;}
  private _forceModeFileNameScript?:string;
  public get ForceModeFileNameScript(): string| undefined {
    return this._forceModeFileNameScript;}
  private _forceModeArgumentScript?: ArgumentsCommandCli;
  public get ForceModeArgumentScript(): ArgumentsCommandCli| undefined {
    return this._forceModeArgumentScript;}
  
  constructor(label:string,
    normalModeFileNameScript:string, normalModeArgumentScript?:ArgumentsCommandCli,
    forceModeFileNameScript?:string, forceModeArgumentScript?: ArgumentsCommandCli,
    parseDataCallback:((data:string,obj?:any) =>IotResult)|undefined=undefined,
    isPossibleToSkip?:boolean, errorMessage?: string
    ){
      super(label,parseDataCallback,isPossibleToSkip,errorMessage);
      //
      this._normalModeFileNameScript=normalModeFileNameScript;
      this._normalModeArgumentScript=normalModeArgumentScript;
      this._forceModeFileNameScript=forceModeFileNameScript;
      this._forceModeArgumentScript=forceModeArgumentScript;
    }
 }
  