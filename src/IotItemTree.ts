import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {BaseTreeItem} from './BaseTreeItem';
import {IotDevice} from './IotDevice';
import {IotDeviceAccount} from './IotDeviceAccount';
import {IotDeviceInformation} from './IotDeviceInformation';
import {IotDevicePackage} from './IotDevicePackage';
import {IotLaunch} from './IotLaunch';
import {IotLaunchOptions} from './IotLaunchOptions';
//

export class IotItemTree extends BaseTreeItem { 
  public Parent: IotDevice| IotDeviceAccount| IotDeviceInformation| IotItemTree| 
  IotDevicePackage| IotLaunch| IotLaunchOptions;
  public Childs: Array<IotItemTree>=[]; 
  public Device: IotDevice;

  constructor(
    label: string,  
    description: string|  undefined,
    tooltip: string | vscode.MarkdownString | undefined,
    collapsibleState: vscode.TreeItemCollapsibleState,
    parent: IotDevice| IotDeviceAccount| IotDeviceInformation| IotItemTree| 
      IotDevicePackage| IotLaunch| IotLaunchOptions,
    device: IotDevice
    ){
      super(label,description,tooltip,collapsibleState);
      this.Parent=parent;
      this.Device=device;
      //view
      this.contextValue="iotitemtree";
  }         
}
