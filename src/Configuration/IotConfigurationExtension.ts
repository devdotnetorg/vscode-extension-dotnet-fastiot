import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { LogLevel } from '../shared/LogLevel';
import { IoTHelper } from '../Helper/IoTHelper';
import { IotResult,StatusResult } from '../IotResult';
import { EntityType } from '../Entity/EntityType';
import { Constants } from "../Constants"
import { IConfigurationExtension } from './IConfigurationExtension';
//block
import { IotBuiltInConfig } from './IotBuiltInConfig';
import { IotConfiguration } from './IotConfiguration';
import { IotConfigurationEntity } from './IotConfigurationEntity';
import { IotConfigurationFolder } from './IotConfigurationFolder';
import { IotConfigurationSbc } from './IotConfigurationSbc';
import { IotConfigurationTemplate } from './IotConfigurationTemplate';
//

export class IotConfigurationExtension implements IConfigurationExtension{
  private _builtInConfig: IotBuiltInConfig;
  //
  private readonly _version:string;
  public get Version(): string {
    return this._version;}
  public get PreviousVersion(): string {
    return this._builtInConfig.PreviousVerExt ;}
  public set PreviousVersion(value:string) {
    this._builtInConfig.PreviousVerExt=value;
    this._builtInConfig.Save();}
  private readonly _mode:vscode.ExtensionMode;
  public get Mode(): vscode.ExtensionMode {
    return this._mode;}
  public get Loglevel():LogLevel {
    return <LogLevel>vscode.workspace.getConfiguration().get('fastiot.loglevel');}
  public Subscriptions: { dispose(): any }[];
  
  constructor(context: vscode.ExtensionContext, builtInConfig: IotBuiltInConfig) {
    //Get info from context
    this._version=`${context.extension.packageJSON.version}`;
    this._mode=context.extensionMode;
    this._builtInConfig=builtInConfig;
    this.Subscriptions=context.subscriptions;
  }

}
