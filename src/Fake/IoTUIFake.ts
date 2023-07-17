import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { StatusBarBackground } from '../UI/StatusBarBackground';
import { IContexUI } from '../UI/IContexUI';
import { IotResult,StatusResult } from '../IotResult';
import { IotDevice } from '../IotDevice';
import { IotTemplate } from '../Templates/IotTemplate';
import { ItemQuickPick } from '../Helper/actionHelper';
import { LogLevel } from '../shared/LogLevel';
import { BadgeActivityBar  } from '../UI/BadgeActivityBar';

export class IoTUIFake implements IContexUI {

  constructor(){}

  public Output(value:string|IotResult,logLevel:LogLevel=LogLevel.Information) {}
  
  public ShowBackgroundNotification(text:string, tooltip?:string | vscode.MarkdownString) {}

  public HideBackgroundNotification() {}

  public ShowNotification(value:IotResult) {}

  public async ShowDeviceDialog(devices:Array<IotDevice>,title = 'Choose a device'):Promise<IotDevice | undefined> {
    return Promise.resolve(undefined);
  }

  public async ShowTemplateDialog(templates:Array<IotTemplate>,title = 'Choose a template'):Promise<IotTemplate | undefined> {
    return Promise.resolve(undefined);
  }

  public BadgeInit() {}
  
  public BadgeAddItem(label:string):string|undefined {
    return undefined;
  } 
  public BadgeDeleteItem(guid:string):boolean|undefined {
    return undefined;
  }
}
