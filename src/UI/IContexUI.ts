import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IotDevice } from '../Deprecated/IotDevice';
import { IotTemplate } from '../Template/IotTemplate';
import { IoT } from '../Types/Enums';
import LogLevel = IoT.Enums.LogLevel;
import Dialog = IoT.Enums.Dialog;
import Contain = IoT.Enums.Contain;

export interface IContexUI {
  Output(value:string|IotResult): void;
  Output(value:string|IotResult,logLevel:LogLevel): void;
  ShowNotification(value:IotResult):void;
  ShowDeviceDialog(devices:Array<IotDevice>,title?:string):Promise<IotDevice | undefined>;
  ShowTemplateDialog(templates:Array<IotTemplate>,title?:string):Promise<IotTemplate | undefined>;
  BadgeInit(label:string, treeView:vscode.TreeView<any>):void;
  BadgeAddItem(label:string):string|undefined;
  BadgeDeleteItem(guid:string):boolean|undefined;
}
