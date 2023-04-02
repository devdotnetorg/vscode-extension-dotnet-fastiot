import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { StatusResult,IotResult } from './IotResult';
import { IotTreeItem } from './IotTreeItem';
import { IotLaunch } from './IotLaunch';

export class IotLaunchOption {
  public Key:string;
  public DefaultValue:any;
  private _launch:IotLaunch;

  constructor(
    key:string,
    defaultValue:any,
    launch: IotLaunch,

    ){
      this.Key=key;
      this.DefaultValue=defaultValue;
      this._launch=launch;
    }

  public GetValue(): any| undefined {
    const result=this._launch.ReadValueofKey(this.Key);
    if(result.Status==StatusResult.Ok)
      return result.returnObject; else
      return this.DefaultValue;
  }

  public SetValue(newValue:any): IotResult {
    if(newValue==this.DefaultValue) newValue=undefined;
    const result=this._launch.WriteValueofKey(this.Key,newValue);
    return result;
  }
 }
  