import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {SshClient} from '../SshClient';

export abstract class BaseTreeItem extends vscode.TreeItem {
  public abstract Parent?: BaseTreeItem| any;
  public abstract Childs: Array<BaseTreeItem| any>;
  public Client:SshClient;
  
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
    this.Client = new SshClient();
  }
}
