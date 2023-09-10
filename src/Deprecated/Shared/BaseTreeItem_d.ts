import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {SshClient_d} from './SshClient_d';

export abstract class BaseTreeItem_d extends vscode.TreeItem {
  public abstract Parent?: BaseTreeItem_d| any;
  public abstract Childs: Array<BaseTreeItem_d| any>;
  public Client:SshClient_d;
  
  constructor(
    label: string,
    description: string|  undefined,
    tooltip: string | vscode.MarkdownString | undefined,
    collapsibleState: vscode.TreeItemCollapsibleState,  
  ){
    super(label, collapsibleState);
    this.description = description;
    //tooltip Markdown
    this.tooltip = tooltip;
    this.Client = new SshClient_d();
  }
}
