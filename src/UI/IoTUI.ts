import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {StatusBarBackgroundItem} from './StatusBarBackgroundItem';

export class IoTUI {
  private _outputChannel:vscode.OutputChannel;
  public StatusBarBackground: StatusBarBackgroundItem;
  
  constructor(
    outputChannel:vscode.OutputChannel,
    statusBarBackground: StatusBarBackgroundItem
  ){
    this._outputChannel=outputChannel;
    this.StatusBarBackground=statusBarBackground;
  }

  public Output(value:string) {
    this._outputChannel.appendLine(value);
  }
}
