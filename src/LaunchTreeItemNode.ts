import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { BaseTreeItemNode } from './BaseTreeItemNode';
import { LaunchOptionNode } from './LaunchOptionNode';

export class LaunchTreeItemNode extends BaseTreeItemNode { 
  public Parent?: LaunchTreeItemNode;
  public Childs: Array<LaunchTreeItemNode| LaunchOptionNode>=[];
  
  constructor(
    label: string,  
    description: string|  undefined,
    tooltip: string | vscode.MarkdownString | undefined,
    collapsibleState: vscode.TreeItemCollapsibleState,
    parent: LaunchTreeItemNode| undefined
    ){
      super(label,description,tooltip,collapsibleState);
      this.Parent=parent;
      //view
      this.contextValue="iotitemtree";
      //
      if(!tooltip) this.tooltip=description;
  }         
}
