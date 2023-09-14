import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {BaseTreeItem_d} from './BaseTreeItem_d';
import {IotDevice_d} from '../IotDevice_d';
import {IotDeviceAccount} from '../IotDeviceAccount';
import {IotDeviceInformation} from '../IotDeviceInformation';
import {IotDevicePackage} from '../IotDevicePackage';
import {LaunchNode} from '../../LaunchView/LaunchNode';

export class IotItemTree_d extends BaseTreeItem_d { 
  public Parent: IotDevice_d| IotDeviceAccount| IotDeviceInformation| IotItemTree_d| 
  IotDevicePackage| LaunchNode;
  public Childs: Array<IotItemTree_d>=[]; 
  public Device: IotDevice_d;

  constructor(
    label: string,  
    description: string|  undefined,
    tooltip: string | vscode.MarkdownString | undefined,
    collapsibleState: vscode.TreeItemCollapsibleState,
    parent: IotDevice_d| IotDeviceAccount| IotDeviceInformation| IotItemTree_d| 
      IotDevicePackage| LaunchNode,
    device: IotDevice_d
    ){
      super(label,description,tooltip,collapsibleState);
      this.Parent=parent;
      this.Device=device;
      //view
      this.contextValue="iotitemtree";
  }         
}
