import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { IoTHelper } from '../Helper/IoTHelper';
import { IotResult,StatusResult } from '../IotResult';
import { EntityType } from '../Entity/EntityType';
import { Constants } from "../Constants"
//block
import { IotBuiltInConfig } from './IotBuiltInConfig';
import { IotConfiguration } from './IotConfiguration';
import { IotConfigurationExtension } from './IotConfigurationExtension';
import { IotConfigurationFolder } from './IotConfigurationFolder';
import { IotConfigurationSbc } from './IotConfigurationSbc';
import { IotConfigurationTemplate } from './IotConfigurationTemplate';
//
import { IConfigurationEntity } from './IConfigurationEntity';

export class IotConfigurationEntity implements IConfigurationEntity {
  private _builtInConfig: IotBuiltInConfig;
  //Entities
  public get IsUpdate():boolean { //Template update
    return <boolean>vscode.workspace.getConfiguration().get('fastiot.entities.isupdate');}
  public get UpdateIntervalInHours():number { //Template update
    return <number>vscode.workspace.getConfiguration().get('fastiot.entities.updateinterval');
    //return 0;
  }
  public get DebugMode():boolean {
    return <boolean>vscode.workspace.getConfiguration().get('fastiot.entities.debug');}
  public get LastUpdateTimeInHours(): number {
    return this._builtInConfig.LastUpdateTimeEntitiesInHours;}
  public set LastUpdateTimeInHours(value:number) {
    this._builtInConfig.LastUpdateTimeEntitiesInHours=value;
    this._builtInConfig.Save();}

  constructor(builtInConfig: IotBuiltInConfig) {
    this._builtInConfig=builtInConfig;
  }

}
