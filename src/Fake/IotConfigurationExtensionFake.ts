import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { IoT } from '../Types/Enums';
import LogLevel = IoT.Enums.LogLevel;
import Dialog = IoT.Enums.Dialog;
import Contain = IoT.Enums.Contain;
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
