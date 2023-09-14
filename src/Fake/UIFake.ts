import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IContexUI } from '../UI/IContexUI';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { ISbc } from '../Sbc/ISbc';
import { IotTemplate } from '../Template/IotTemplate';
import { ItemQuickPick } from '../Helper/actionHelper';
import { IoT } from '../Types/Enums';
import LogLevel = IoT.Enums.LogLevel;
import Dialog = IoT.Enums.Dialog;
import Contain = IoT.Enums.Contain;
import { BadgeActivityBar  } from '../UI/BadgeActivityBar';

export class UIFake implements IContexUI {

  constructor(){}

  public Output(value:string|IotResult,logLevel:LogLevel=LogLevel.Information) {}
  
  public ShowBackgroundNotification(text:string, tooltip?:string | vscode.MarkdownString) {}

  public HideBackgroundNotification() {}

  public ShowNotification(value:IotResult) {}

  public async ShowSbcDialog(sbcs:Array<ISbc>,title = 'Choose a device'):Promise<ISbc| undefined> {
    return Promise.resolve(undefined);
  }

  public async ShowTemplateDialog(templates:Array<IotTemplate>,title = 'Choose a template'):Promise<IotTemplate| undefined> {
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
