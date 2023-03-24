import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export abstract class BaseTreeItemNode extends vscode.TreeItem {
  public abstract Parent: BaseTreeItemNode| any| undefined;
  public abstract Childs: Array<BaseTreeItemNode| any>;
  
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
  }
}
