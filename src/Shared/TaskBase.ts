import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IoT } from '../Types/Enums';
import LogLevel = IoT.Enums.LogLevel;
import { ArgumentsCommandCli } from './ArgumentsCommandCli';
import { IoTHelper } from '../Helper/IoTHelper';

export abstract class TaskBase {
  private _id:string;
  public get Id(): string {
    return this._id;}
  private _label:string;
  public get Label(): string {
    return this._label;}
  private _funcNameParseData?:string;
  public get FuncNameParseData(): string| undefined {
    return this._funcNameParseData;}
  private _isPossibleToSkip?:boolean;
  public get IsPossibleToSkip(): boolean| undefined {
    return this._isPossibleToSkip;}
  private _errorMessage?:string;
  public get ErrorMessage(): string| undefined {
    return this._errorMessage;}
  public ObjForFuncParseData?:any;

  constructor(label:string, funcNameParseData?:string,
    isPossibleToSkip?:boolean, errorMessage?: string
    ){
      this._id=IoTHelper.CreateGuid();
      this._label=label;
      //
      this._funcNameParseData=funcNameParseData;
      this._isPossibleToSkip=isPossibleToSkip;
      this._errorMessage=errorMessage;
    }
 }
  