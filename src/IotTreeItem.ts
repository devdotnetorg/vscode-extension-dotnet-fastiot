import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {StatusResult,IotResult} from './IotResult';

export class IotTreeItem {  
  public Status: StatusResult;
  public Label: string;
  public Description?: string;
  public Tooltip?: string | vscode.MarkdownString;

  constructor(
    label: string,
    description: string| undefined=undefined,
    tooltip: string| vscode.MarkdownString| undefined=undefined,
    status: StatusResult=StatusResult.None
    ){
      this.Label=label;
      this.Description=description;
      this.Tooltip=tooltip;
      this.Status=status;
    }
 }
  