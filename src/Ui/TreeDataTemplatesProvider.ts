import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { LaunchTreeItemNode } from '../LaunchView/LaunchTreeItemNode';
import { LaunchNode } from '../LaunchView/LaunchNode';

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
