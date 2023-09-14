import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { ISbc } from '../Sbc/ISbc';
import { IotTemplate } from '../Template/IotTemplate';
import { IoT } from '../Types/Enums';
import LogLevel = IoT.Enums.LogLevel;
import Dialog = IoT.Enums.Dialog;
import Contain = IoT.Enums.Contain;

export interface IContexUI {
  //Message
  Output(value:string|IotResult): void;
  Output(value:string|IotResult,logLevel:LogLevel): void;
  ShowNotification(value:IotResult):void;
  //Dialogs
  ShowSbcDialog(sbcs:Array<ISbc>,title?:string):Promise<ISbc| undefined>;
  ShowTemplateDialog(templates:Array<IotTemplate>,title?:string):Promise<IotTemplate| undefined>;
  //Badge
  BadgeInit(label:string, treeView:vscode.TreeView<any>):void;
  BadgeAddItem(label:string):string|undefined;
  BadgeDeleteItem(guid:string):boolean|undefined;
}
