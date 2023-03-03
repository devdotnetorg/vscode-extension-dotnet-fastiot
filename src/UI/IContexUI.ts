import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {IotResult,StatusResult} from '../IotResult';

export interface IContexUI {
  Output(value:string|IotResult): void;
  ShowBackgroundNotification(text:string, tooltip?:string | vscode.MarkdownString| undefined):void;
  HideBackgroundNotification():void;
  ShowNotification(value:IotResult):void;
}
