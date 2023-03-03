import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {StatusBarBackground} from './StatusBarBackground';
import {IContexUI} from './IContexUI';
import {IotResult,StatusResult} from '../IotResult';

export class IoTUI implements IContexUI {
  private _outputChannel:vscode.OutputChannel;
  private _statusBarBackground: StatusBarBackground;
  
  constructor(
    outputChannel:vscode.OutputChannel,
    statusBarBackground: StatusBarBackground
  ){
    this._outputChannel=outputChannel;
    this._statusBarBackground=statusBarBackground;
  }

  public Output(value:string|IotResult) {
    let msg="";
    if (typeof value === 'string') {
      msg=value;
    } else {
      msg=value.toMultiLineString("head");
    }
    this._outputChannel.appendLine(msg);
  }

  public ShowBackgroundNotification(text:string, tooltip:string | vscode.MarkdownString| undefined=undefined) {
    this._statusBarBackground.showAnimation(text,tooltip);
  }

  public HideBackgroundNotification = () => this._statusBarBackground.hide();

  public ShowNotification(value:IotResult) {
    if (!value.Message) return;
    switch(value.Status) { 
      case StatusResult.Ok: {
         vscode.window.showInformationMessage(value.Message);
         break; 
      } 
      case StatusResult.Error: {
         vscode.window.showErrorMessage(value.Message);
         break; 
      }
      case StatusResult.No: {
        vscode.window.showWarningMessage(value.Message);
        break; 
      } 
      default: { 
        vscode.window.showInformationMessage(value.Message);
         break; 
      } 
   }
  }

  public RunTask(value:IotResult,ifOK:() =>void,ifError:() =>void) {
    switch(value.Status) { 
      case StatusResult.Ok: {
        ifOK();
        break; 
      } 
      case StatusResult.Error: {
        ifError();
        break;
      }
      default: { 
         //statements; 
         break; 
      } 
   }
  }
}
