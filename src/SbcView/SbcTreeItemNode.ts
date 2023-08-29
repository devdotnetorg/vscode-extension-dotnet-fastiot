import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { BaseTreeItemNode } from '../shared/BaseTreeItemNode';
import { SbcNode } from './SbcNode';

export class SbcTreeItemNode extends BaseTreeItemNode {
  public IdSbc:string|undefined;
  public Parent?: SbcTreeItemNode;
  public Childs: Array<SbcTreeItemNode>=[];
  
  constructor(
    label: string,  
    description?: string,
    tooltip?: string | vscode.MarkdownString,
    collapsibleState?: vscode.TreeItemCollapsibleState,
    parent?: SbcTreeItemNode
    ){
      super(label,description,tooltip,collapsibleState);
      this.Parent=parent;
      //view
      this.contextValue="iotitemtree";
      //
      if(!tooltip) this.tooltip=description;
  }         
}
