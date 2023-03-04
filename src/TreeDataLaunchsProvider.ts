import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { LaunchTreeItemNode } from './LaunchTreeItemNode';
import { IotDevice } from './IotDevice';
import { LaunchNode } from './LaunchNode';
import { IoTHelper } from './Helper/IoTHelper';
import { IotResult,StatusResult } from './IotResult';
import { IotConfiguration } from './Configuration/IotConfiguration';
import { IotTemplate } from './Templates/IotTemplate';
import { IotLaunch } from './IotLaunch';

export class TreeDataLaunchsProvider implements vscode.TreeDataProvider<LaunchTreeItemNode> {    
  public RootItems:Array<LaunchNode>=[];

  public Config: IotConfiguration;
    
  private _onDidChangeTreeData: vscode.EventEmitter<LaunchTreeItemNode| undefined | null | void> = 
    new vscode.EventEmitter<LaunchTreeItemNode| undefined | null | void>();
  public readonly onDidChangeTreeData: vscode.Event<LaunchTreeItemNode| undefined | null | void> = 
    this._onDidChangeTreeData.event;

  private _devices: Array<IotDevice>;

  constructor(
    config:IotConfiguration,
    devices: Array<IotDevice>
  ) {
      //Set config
      this.Config=config;
      this._devices=devices;
  }

  public getTreeItem(element: LaunchTreeItemNode): vscode.TreeItem | Thenable<LaunchTreeItemNode> {
    return element;
  }  

  public getChildren(element?: LaunchTreeItemNode): Thenable<LaunchTreeItemNode[]> {
    if (element) {
      //Creating a child element
      let objArray: Array<LaunchTreeItemNode> =[];
      element.Childs.forEach(child =>
        {	
          objArray.push(child)
        });
      return Promise.resolve(objArray);
    }else
    {
      //Creating a root structure            
      return Promise.resolve(this.RootItems);        
    }    
  }

  public Refresh(): void {        
    this._onDidChangeTreeData.fire();    
  }

  public RefreshsFull(): IotResult {
    let result:IotResult;
    result= new IotResult(StatusResult.Ok);
    if(this.Config.Folder.WorkspaceFolder) result = this.RecoveryLaunchs();  
    this.Refresh();
    return result;  
  }
  
  public async RecoveryLaunchsAsync(): Promise<IotResult>{
    return Promise.resolve(this.RecoveryLaunchs());  
  }

  public RecoveryLaunchs():IotResult {
    let result:IotResult;
    try
    {
      //Clear
      this.RootItems = [];
      //Recovery launchs from config in JSON format
      result=new IotLaunch(this.Config.Folder.WorkspaceFolder ?? "non").
        GetAllLaunchs(this._devices);
      if(result.Status==StatusResult.Error) return result;
      let launchs:IotLaunch[];
      launchs=<IotLaunch[]>result.returnObject;
      launchs.forEach((launch) => {
        //add
        let launchNode = new LaunchNode(launch);
        this.RootItems.push(launchNode);
      });
      result= new IotResult(StatusResult.Ok);      
    }
    catch (err:any)
    {
      result= new IotResult(StatusResult.Error,`RecoveryLaunchs. Path: ${this.Config.Folder.WorkspaceFolder}`,err);
    }
    //Refresh treeView
    this.Refresh();
    return result;
  }
  
}
