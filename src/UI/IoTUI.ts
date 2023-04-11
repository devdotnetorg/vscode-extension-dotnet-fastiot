import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { StatusBarBackground } from './StatusBarBackground';
import { IContexUI } from './IContexUI';
import { IotResult,StatusResult } from '../IotResult';
import { IotDevice } from '../IotDevice';
import { IotTemplate } from '../Templates/IotTemplate';
import { ItemQuickPick } from '../Helper/actionHelper';
import { LogLevel } from '../LogLevel';

export class IoTUI implements IContexUI {
  private _outputChannel:vscode.OutputChannel;
  private _statusBarBackground: StatusBarBackground;
  private _currentLogLevel:LogLevel;
  
  constructor(logLevel:LogLevel){
    //OutputChannel
	  this._outputChannel = vscode.window.createOutputChannel(".NET FastIoT");
	  //StatusBar
	  this._statusBarBackground= new StatusBarBackground(
		  vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000));
    //LogLevel
    this._currentLogLevel=logLevel;
  }

  public Output(value:string|IotResult,logLevel:LogLevel=LogLevel.Information) {
    let msg="";
    if (typeof value === 'string') {
      //string
      msg=value;
    } else {
      //IotResult
      if(value.logLevel) {
        logLevel=value.logLevel;
      }else {
        switch(value.Status) { 
          case StatusResult.Error: {
            logLevel=LogLevel.Error;
            break; 
          } 
          case StatusResult.No: { 
            logLevel=LogLevel.Warning;
            break; 
          }
          case StatusResult.Ok: {
            logLevel=LogLevel.Information;
            break; 
          } 
          default: {
            logLevel=LogLevel.Information;
            break; 
          } 
        }
      }
      msg=value.toString();
    }
    //Output
    if(logLevel>=this._currentLogLevel) this._outputChannel.appendLine(msg);
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

  public async ShowDeviceDialog(devices:Array<IotDevice>,title = 'Choose a device'):Promise<IotDevice | undefined> {
    //for next version
    /*
    //Get all architectures
    let architectures:string[]=[];
    devices.forEach((device) => {
      if(device.Information.Architecture)
      architectures.push(device.Information.Architecture);
    });
    //removing duplicate elements
    architectures=Array.from(new Set(architectures));
    //Sort
    architectures=architectures.sort((a, b)=>{
      if(a < b) { return -1; };
      if(a > b) { return 1; };
      return 0;
    });
    //create a list
    let itemDevices:Array<ItemQuickPick>=[];
    architectures.forEach((architecture) => {
      const devicesA=devices.filter((e:IotDevice) => e.Information.Architecture==architecture);
      //make a separator

      //add

    });
    */
    //create a list
    let itemDevices:Array<ItemQuickPick>=[];
    devices.forEach((device) => {
        const label=`${device.label}`;
        const description=`${device.Information.Architecture}`;
        const detail=`$(circuit-board) ${device.Information.BoardName} $(terminal-linux) ${device.Information.OsDescription} $(circle-filled) ${device.Information.OsKernel} $(account) ${device.Account.UserName}`;
        const item = new ItemQuickPick(label,description,device,detail);
        itemDevices.push(item);
    });
    //Select
    const SELECTED_ITEM = await vscode.window.showQuickPick(itemDevices,{title: title,placeHolder:`Developer board`});
    if(SELECTED_ITEM)
      return Promise.resolve(<IotDevice>SELECTED_ITEM.value);
      else Promise.resolve(undefined);
  }

  public async ShowTemplateDialog(templates:Array<IotTemplate>,title = 'Choose a template'):Promise<IotTemplate | undefined> {
    let itemTemplates:Array<ItemQuickPick>=[];
    templates.forEach((template) => {
        const item = new ItemQuickPick(<string>template.Attributes.Label,
            `Language: ${template.Attributes.Language}`,template,`${template.Attributes.Detail}`);
        itemTemplates.push(item);
    });
    const SELECTED_ITEM = await vscode.window.showQuickPick(itemTemplates,{title: title,placeHolder:`Template`});
    if(SELECTED_ITEM)
      return Promise.resolve(<IotTemplate>SELECTED_ITEM.value);
      else Promise.resolve(undefined);
  }
}
