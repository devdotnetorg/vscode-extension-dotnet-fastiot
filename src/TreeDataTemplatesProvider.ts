import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {BaseTreeItem} from './BaseTreeItem';
import {IotLaunch} from './IotLaunch';
import {IotResult,StatusResult} from './IotResult';

export class TreeDataTemplatesProvider implements vscode.TreeDataProvider<BaseTreeItem> {

  constructor() {}

  public getTreeItem(element: BaseTreeItem): vscode.TreeItem | Thenable<BaseTreeItem> {
    return element;
  }  
  
  public getChildren(element?: BaseTreeItem): Thenable<BaseTreeItem[]> {
      //Creating a root structure   
      let RootItems:Array<IotLaunch>=[];         
      return Promise.resolve(RootItems);        
  }

}
