import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { LaunchTreeItemNode } from './LaunchTreeItemNode';
import { LaunchNode } from './LaunchNode';
import { IotResult,StatusResult } from './Shared/IotResult';

export class TreeDataTemplatesProvider implements vscode.TreeDataProvider<LaunchTreeItemNode> {

  constructor() {}

  public getTreeItem(element: LaunchTreeItemNode): vscode.TreeItem | Thenable<LaunchTreeItemNode> {
    return element;
  }  
  
  public getChildren(element?: LaunchTreeItemNode): Thenable<LaunchTreeItemNode[]> {
      //Creating a root structure   
      let RootItems:Array<LaunchNode>=[];         
      return Promise.resolve(RootItems);        
  }

}
