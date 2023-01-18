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
import {IotConfiguration} from './Configuration/IotConfiguration';
import {IotTemplate} from './Templates/IotTemplate';
import { MakeDirSync } from './Helper/IoTHelper';

export class TreeDataProjectsProvider implements vscode.TreeDataProvider<BaseTreeItem> {

  private _config:IotConfiguration
  public get Config(): IotConfiguration {
    return this._config;}
  
  constructor(config:IotConfiguration 
  ) {
    //Set config
    this._config=config;          
  }

  public getTreeItem(element: BaseTreeItem): vscode.TreeItem | Thenable<BaseTreeItem> {
    return element;
  }  
  
  public getChildren(element?: BaseTreeItem): Thenable<BaseTreeItem[]> {
      //Creating a root structure   
      let RootItems:Array<IotLaunchConfiguration>=[];         
      return Promise.resolve(RootItems);        
  }

  public CreateProject(device:IotDevice,template:IotTemplate, folderPath:string,nameProject:string) {
    //Create dir
    MakeDirSync(folderPath);
    //next


  }
 
}
