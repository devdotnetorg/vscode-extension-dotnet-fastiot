import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {BaseTreeItem} from './BaseTreeItem';

import { IotDevice } from './IotDevice';
import { IotDeviceAccount } from './IotDeviceAccount';
import { IotDeviceInformation } from './IotDeviceInformation';
import { IotItemTree } from './IotItemTree';
import { IotDevicePackage } from './IotDevicePackage';
import { IotLaunchConfiguration } from './IotLaunchConfiguration';
import {Sleep,DeleteComments} from './Helper/IoTHelper';

import { IotResult,StatusResult } from './IotResult';
import {IotConfiguration} from './IotConfiguration';

export class TreeDataProjectsProvider implements vscode.TreeDataProvider<BaseTreeItem> {

  constructor(    

  ) {            
      
  }

  public getTreeItem(element: BaseTreeItem): vscode.TreeItem | Thenable<BaseTreeItem> {
    return element;
  }  
  
  public getChildren(element?: BaseTreeItem): Thenable<BaseTreeItem[]> {
      //Creating a root structure   
      let RootItems:Array<IotLaunchConfiguration>=[];         
      return Promise.resolve(RootItems);        
  }

}
