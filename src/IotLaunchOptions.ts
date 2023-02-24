import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {BaseTreeItem} from './BaseTreeItem';
import {IotDevice} from './IotDevice';
import {IotItemTree} from './IotItemTree';
import {StatusResult,IotResult} from './IotResult';
import {IotLaunch} from './IotLaunch';

export class IotLaunchOptions extends BaseTreeItem{  
  public Parent: BaseTreeItem| any| undefined;
  public Childs: Array<IotItemTree>=[];
  public Device: IotDevice| undefined;
  private _launch: IotLaunch;

  constructor(
    label: string,
    description: string|  undefined,
    tooltip: string | vscode.MarkdownString | undefined,
    collapsibleState: vscode.TreeItemCollapsibleState,
    parent: IotLaunch| IotLaunchOptions,
    launch: IotLaunch
  ){
    super(label,description,tooltip,collapsibleState);
    this.Parent=parent;
    this._launch=launch;
  }

  public Build(){
    //Create childs
    this.CreateChildElements();
  }
 
  private CreateChildElements()
  {
    //create child elements
    this.Childs=[];      
    let element:IotItemTree;
    const contextValue="iotenviromentoption";
    const iconPathError = {
      light: path.join(__filename, '..', '..', 'resources', 'light', 'error.svg'),
      dark: path.join(__filename, '..', '..', 'resources', 'dark', 'error.svg')
    };
    //
    element = new IotItemTree("ID Launch",this._launch.IdLaunch,
    this._launch.IdLaunch,
      vscode.TreeItemCollapsibleState.None,this,<IotDevice>this.Device);
    element.contextValue=contextValue;
    this.Childs.push(element);
    //
    element = new IotItemTree("Project",this._launch.PathProject,
      this._launch.PathProject,
      vscode.TreeItemCollapsibleState.None,this,<IotDevice>this.Device);
    element.contextValue=contextValue;
    if(!this._launch.PathProject||this._launch.PathProject=="")
    {
      element.description=element.tooltip="not found";
      element.iconPath=iconPathError;
    }
    this.Childs.push(element);
    //
    let label=<string>(this._launch.Device?.label)+" "+this._launch.Device?.Information.Architecture;
    element = new IotItemTree("Device",label,`label: ${label}. Id device: ${this._launch.Device?.IdDevice}`,
      vscode.TreeItemCollapsibleState.None,this,<IotDevice>this.Device);
    element.contextValue=contextValue;
    if(!this._launch.Device)
    {
      element.description=element.tooltip="not found";
      element.iconPath=iconPathError;
    }
    this.Childs.push(element);
    //
    element = new IotItemTree("Username",this._launch.Device?.Account.UserName,this._launch.Device?.Account.UserName,
      vscode.TreeItemCollapsibleState.None,this,<IotDevice>this.Device);
    element.contextValue=contextValue;
    if(!this._launch.Device)
    {
      element.description=element.tooltip="not found";
      element.iconPath=iconPathError;
    }
    this.Childs.push(element);
  }

  iconPath = {
   light: path.join(__filename, '..', '..', 'resources', 'light', 'info.svg'),
   dark: path.join(__filename, '..', '..', 'resources', 'dark', 'info.svg')
 };
}
