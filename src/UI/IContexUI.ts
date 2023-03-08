import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IotResult,StatusResult } from '../IotResult';
import { IotDevice } from '../IotDevice';
import { IotTemplate } from '../Templates/IotTemplate';

export interface IContexUI {
  Output(value:string|IotResult): void;
  ShowBackgroundNotification(text:string, tooltip?:string | vscode.MarkdownString| undefined):void;
  HideBackgroundNotification():void;
  ShowNotification(value:IotResult):void;
  ShowDeviceDialog(devices:Array<IotDevice>,title?:string):Promise<IotDevice | undefined>;
  ShowTemplateDialog(templates:Array<IotTemplate>,title?:string):Promise<IotTemplate | undefined>;
}
