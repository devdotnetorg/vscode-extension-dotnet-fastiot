import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export abstract class BaseTreeItemNode extends vscode.TreeItem {
  public abstract Parent?: BaseTreeItemNode| any;
  public abstract Childs: Array<BaseTreeItemNode| any>;
  
  constructor(
    label: string,
    description?: string,
    tooltip?: string| vscode.MarkdownString,
    collapsibleState?: vscode.TreeItemCollapsibleState,
  ){
    super(label, collapsibleState);
    this.description = description;
    //tooltip Markdown
    this.tooltip = tooltip;
  }
}
