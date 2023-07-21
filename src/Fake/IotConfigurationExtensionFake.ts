import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { LogLevel } from '../shared/LogLevel';
import { IoTHelper } from '../Helper/IoTHelper';
import { IotResult,StatusResult } from '../IotResult';
import { EntityType } from '../Entity/EntityType';
import { Constants } from "../Constants"
import { IConfigurationExtension } from '../Configuration/IConfigurationExtension';

export class IotConfigurationExtensionFake implements IConfigurationExtension{
  public Version: string ="";
  public PreviousVersion: string="";
  public Mode: vscode.ExtensionMode = vscode.ExtensionMode.Test;
  public Loglevel:LogLevel = LogLevel.Debug;
  public get Subscriptions(): { dispose(): any }[] {
    const item:{ dispose(): any }[]=[];
    return item;
  };
  
  constructor() {}

}
