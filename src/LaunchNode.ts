import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { LaunchTreeItemNode } from './LaunchTreeItemNode';
import { IotResult,StatusResult } from './IotResult';
import { IotLaunch } from './IotLaunch';
import { IotTreeItem } from './IotTreeItem';
import { LaunchOptionNode } from './LaunchOptionNode';
import { IotLaunchOption } from './IotLaunchOption';

export class LaunchNode extends LaunchTreeItemNode {  
  public Parent: undefined;
  public Childs: Array<LaunchTreeItemNode>=[];

  private _launch:IotLaunch;
  public get Launch(): IotLaunch {
    return this._launch;}

  public Configuration:LaunchTreeItemNode;
  public Environment:LaunchTreeItemNode;
  public Options:LaunchTreeItemNode;

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
    //Configuration
    this.Configuration = new LaunchTreeItemNode("Configuration",undefined,"Configuration",
      vscode.TreeItemCollapsibleState.Collapsed,this);
      /*
      this.Configuration.iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'light', 'info.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'dark', 'info.svg')
      };
      */
    this.Configuration.iconPath = new vscode.ThemeIcon("gear");
    //Environments
    this.Environment=new LaunchTreeItemNode("Environment",undefined,"Environment",
      vscode.TreeItemCollapsibleState.Collapsed,this);
    this.Environment.contextValue="iotenviroment";
    /*
    this.Environment.iconPath = {
      light: path.join(__filename, '..', '..', 'resources', 'light', 'enviroment.svg'),
      dark: path.join(__filename, '..', '..', 'resources', 'dark', 'enviroment.svg')
    };
    */
    this.Environment.iconPath = new vscode.ThemeIcon("note");
    //Options
    this.Options=new LaunchTreeItemNode("Options",undefined,"Options",
    vscode.TreeItemCollapsibleState.Collapsed,this);
    this.Options.contextValue="iotlaunchoptions";
    this.Options.iconPath = new vscode.ThemeIcon("three-bars");
    //Added in childs
    this.Childs.push(this.Configuration);
    this.Childs.push(this.Environment);
    this.Childs.push(this.Options);
    //Build
    this.Build();
  }

  public Refresh() {  
    this.Build();
  }

  private Build() {
    this.BuildConfiguration();
    this.BuildEnvironment();
    this.BuildOptions();
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

  private BuildOptions() {
    //main
    //create child elements
    this.Options.Childs=[];
    let item:LaunchOptionNode;
    //Console (terminal) window
    //https://github.com/OmniSharp/omnisharp-vscode/blob/master/debugger-launchjson.md#console-terminal-window
    let label="Console (terminal)";
    let headtooltip=`The "console" setting controls what console (terminal) window the target app is launched into:`
    let iotLaunchOption=new IotLaunchOption("console","internalConsole",this._launch);
    let values:Map<any,string>= new Map<any,string>();
    values.set("internalConsole","the target process's console output (stdout/stderr) goes to the VS Code Debug Console.");
    values.set("integratedTerminal","the target process will run inside VS Code's integrated terminal.");
    values.set("externalTerminal","the target process will run inside its own external terminal.");
    item = new LaunchOptionNode(label,headtooltip,this,iotLaunchOption,values);
    item.ReadValue();
    this.Options.Childs.push(item);
    //Just My Code
    //https://medium.com/@thiagoalves/how-to-disable-the-just-my-code-setting-on-the-vs-code-debugger-f5fd774e0af8
    label="Just My Code";
    headtooltip=`Debugging just my code:`
    iotLaunchOption=new IotLaunchOption("justMyCode",true,this._launch);
    values = new Map<any,string>();
    values.set(true,"True");
    values.set(false,"False");
    item = new LaunchOptionNode(label,headtooltip,this,iotLaunchOption,values);
    item.ReadValue();
    this.Options.Childs.push(item);
  }

  /*
  iconPath = {
    light: path.join(__filename, '..', '..', 'resources', 'light', 'lanch.svg'),
    dark: path.join(__filename, '..', '..', 'resources', 'dark', 'lanch.svg')
  };
  */

  iconPath = new vscode.ThemeIcon("play");

}
