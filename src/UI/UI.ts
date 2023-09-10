import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IContexUI } from './IContexUI';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IotDevice } from '../Deprecated/IotDevice';
import { IotTemplate } from '../Template/IotTemplate';
import { ItemQuickPick } from '../Helper/actionHelper';
import { IoT } from '../Types/Enums';
import LogLevel = IoT.Enums.LogLevel;
import Dialog = IoT.Enums.Dialog;
import Contain = IoT.Enums.Contain;
import { BadgeActivityBar  } from './BadgeActivityBar';

export class UI implements IContexUI {
  private _outputChannel:vscode.OutputChannel;
  private readonly _currentLogLevel:LogLevel;
  private _badgeActivityBar?:BadgeActivityBar;
  
  constructor(logLevel:LogLevel){
    //OutputChannel
	  this._outputChannel = vscode.window.createOutputChannel(".NET FastIoT");
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
      if (logLevel!=LogLevel.Information) value.logLevel=logLevel;
      if(value.logLevel) {
        logLevel=value.logLevel;
      }else {
        switch(value.Status) { 
          case StatusResult.Error: {
            logLevel=LogLevel.Error;
            break; 
          } 
          case StatusResult.No: { 
            logLevel=LogLevel.Debug;
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

  public async ShowDeviceDialog(devices:Array<IotDevice>,title = 'Choose a single-board computer'):Promise<IotDevice | undefined> {
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
    let itemDevices:Array<ItemQuickPick|vscode.QuickPickItem>=[];
    architectures.forEach((architecture) => {
      //make a separator
      const architectureSeparator:vscode.QuickPickItem = {
        label: architecture,
        kind: vscode.QuickPickItemKind.Separator
      };
      //get devices for only one architecture
      const devicesA=devices.filter((e:IotDevice) => e.Information.Architecture==architecture);
      //create block
      itemDevices.push(architectureSeparator);
      //create a list
      //let itemDevices:Array<ItemQuickPick>=[];
      devicesA.forEach((device) => {
        const label=`${device.label}`;
        const description=`${device.Information.Architecture}`;
        const detail=`$(circuit-board) ${device.Information.BoardName} $(terminal-linux) ${device.Information.OsDescription} $(circle-filled) ${device.Information.OsKernel} $(account) ${device.Account.UserName}`;
        const item = new ItemQuickPick(label,description,device,detail);
        itemDevices.push(item);
      });
    });

    /*
    //create a list
    //let itemDevices:Array<ItemQuickPick>=[];
    devices.forEach((device) => {
        const label=`${device.label}`;
        const description=`${device.Information.Architecture}`;
        const detail=`$(circuit-board) ${device.Information.BoardName} $(terminal-linux) ${device.Information.OsDescription} $(circle-filled) ${device.Information.OsKernel} $(account) ${device.Account.UserName}`;
        const item = new ItemQuickPick(label,description,device,detail);
        itemDevices.push(item);
    });
    */
    //Select
    const SELECTED_ITEM = await vscode.window.showQuickPick(itemDevices,{title: title,placeHolder:`Single-board computer`});
    if(SELECTED_ITEM)
      return Promise.resolve(<IotDevice>(SELECTED_ITEM as ItemQuickPick).value);
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

  //Badge
  public BadgeInit = (label:string, treeView:vscode.TreeView<any>) => 
    this._badgeActivityBar = new BadgeActivityBar(label,treeView);
  public BadgeAddItem(label:string):string|undefined {
    return this._badgeActivityBar?.AddItem(label);
  } 
  public BadgeDeleteItem(guid:string):boolean|undefined {
    return this._badgeActivityBar?.DeleteItem(guid);
  }
}
