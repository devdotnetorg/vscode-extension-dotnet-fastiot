import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { StatusResult,IotResult } from './IotResult';
import { LaunchTreeItemNode } from './LaunchTreeItemNode';
import { IotLaunchOption } from './IotLaunchOption';

export class LaunchOptionNode extends LaunchTreeItemNode {
  private _iotLaunchOption:IotLaunchOption;
  public Values:Map<any,string>;
  public Headtooltip:string| vscode.MarkdownString| undefined;

  constructor(
    label: string,
    headtooltip: string | vscode.MarkdownString | undefined,
    parent: LaunchTreeItemNode| undefined,
    iotLaunchOption:IotLaunchOption,
    values:Map<any,string>
    ){
      super(label,undefined,undefined,vscode.TreeItemCollapsibleState.None,parent);
      //view
      this.contextValue="iotlaunchoption";
      //init
      this.Headtooltip=headtooltip;
      this.Values=values;
      this._iotLaunchOption = iotLaunchOption;
  }
  
  public ReadValue() {
    //get
    const value=this._iotLaunchOption.GetValue();
    //
    this.description=`${value}`;
    let desText=this.Values.get(value);
    if(!desText) desText=`${value}`;
    this.tooltip=new vscode.MarkdownString(`${this.Headtooltip}\n\n(${this.description}) ${desText}`);
  }

  public WriteValue(value:any) {
    //set
    const result=this._iotLaunchOption.SetValue(value);
    if(result.Status!=StatusResult.Ok) return;
    //
    this.description=`${value}`;
    let desText=this.Values.get(value);
    if(!desText) desText=`${value}`;
    this.tooltip=new vscode.MarkdownString(`${this.Headtooltip}\n\n(${this.description}) ${desText}`);
  }

  public GetDefaultValue():any {
    //get
    return this._iotLaunchOption.DefaultValue;
  }
}
