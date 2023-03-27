import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { LaunchTreeItemNode } from './LaunchTreeItemNode';
import { IotResult,StatusResult } from './IotResult';
import { IotLaunch } from './IotLaunch';
import { IotTreeItem } from './IotTreeItem';

export class LaunchNode extends LaunchTreeItemNode {  
  public Parent: undefined;
  public Childs: Array<LaunchTreeItemNode>=[];

  private _launch:IotLaunch;
  public get Launch(): IotLaunch {
    return this._launch;}

  public Configuration:LaunchTreeItemNode;
  public Environment:LaunchTreeItemNode;

  constructor(launch: IotLaunch){
    super("Configuration",undefined, undefined,vscode.TreeItemCollapsibleState.Collapsed,undefined);
    this._launch=launch;
    this.label=this._launch.Label;
    let tooltip:vscode.MarkdownString;
    if(this._launch.Description)
      tooltip= new vscode.MarkdownString(`$(debug-start) ${this._launch.Label}   \nDescription: ${this._launch.Description}`,true);
    else
      tooltip=new vscode.MarkdownString(`$(debug-start) ${this._launch.Label}`,true);
    this.tooltip=tooltip;
    //view
    this.contextValue="iotlaunch";
    //Options
    this.Configuration = new LaunchTreeItemNode("Configuration",undefined,"Configuration",
      vscode.TreeItemCollapsibleState.Collapsed,this);
      this.Configuration.iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'light', 'info.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'dark', 'info.svg')
      };
    //Added in childs
    this.Childs.push(this.Configuration);
    //Environments
    this.Environment=new LaunchTreeItemNode("Environment",undefined,"Environment",
      vscode.TreeItemCollapsibleState.Collapsed,this);
    this.Environment.contextValue="iotenviroment";
    this.Environment.iconPath = {
      light: path.join(__filename, '..', '..', 'resources', 'light', 'enviroment.svg'),
      dark: path.join(__filename, '..', '..', 'resources', 'dark', 'enviroment.svg')
    };
    //Added in childs
    this.Childs.push(this.Environment);
    //Build
    this.Build();
  }

  public Refresh() {  
    this.Build();
  }

  private Build() {
    this.BuildConfiguration();
    this.BuildEnvironment();
  }

  private BuildConfiguration() {
    //main
    const iconPathError = {
      light: path.join(__filename, '..', '..', 'resources', 'light', 'error.svg'),
      dark: path.join(__filename, '..', '..', 'resources', 'dark', 'error.svg')
    };
    //create child elements
    this.Configuration.Childs=[];
    let item:LaunchTreeItemNode;
    const result=this._launch.GetConfigurationItems();
    if(result.Status==StatusResult.Error) return result;
    //read
    const options=<IotTreeItem[]>result.returnObject;
    options.forEach((value) => {
      item=new LaunchTreeItemNode(value.Label,value.Description,
        value.Tooltip,vscode.TreeItemCollapsibleState.None,this.Configuration);
      item.contextValue="iotenviromentoption";
      if(value.Status==StatusResult.Error) item.iconPath=iconPathError;
      this.Configuration.Childs.push(item);
    });
  }

  public BuildEnvironment() {
    //main
    //create child elements
    this.Environment.Childs=[];
    let item:LaunchTreeItemNode;
    this._launch.Environment.Items.forEach((value,key) => {
      item = new LaunchTreeItemNode(key,value,value,
        vscode.TreeItemCollapsibleState.None,this.Environment);
      item.contextValue="iotenviromentitem"
      this.Environment.Childs.push(item);      
    });
  }

  iconPath = {
    light: path.join(__filename, '..', '..', 'resources', 'light', 'lanch.svg'),
    dark: path.join(__filename, '..', '..', 'resources', 'dark', 'lanch.svg')
  };
}
