import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {BaseTreeItem} from './BaseTreeItem';

import { IotDevice } from './IotDevice';
import { IotDeviceAccount } from './IotDeviceAccount';
import { IotDeviceInformation } from './IotDeviceInformation';
import { IotItemTree } from './IotItemTree';
import { IotDevicePackage } from './IotDevicePackage';
import { IotLaunchConfiguration } from './IotLaunchConfiguration';
import {IoTHelper} from './Helper/IoTHelper';

import { IotResult,StatusResult } from './IotResult';
import {IotConfiguration} from './Configuration/IotConfiguration';
import {IotTemplate} from './Templates/IotTemplate';

export class TreeDataLaunchsProvider implements vscode.TreeDataProvider<BaseTreeItem> {    
  public RootItems:Array<IotLaunchConfiguration>=[];

  private _isStopStatusBar:boolean=false;
  private _statusBarText:string="";
  public OutputChannel:vscode.OutputChannel;

  private _config:IotConfiguration
  public get Config(): IotConfiguration {
    return this._config;}

  private _onDidChangeTreeData: vscode.EventEmitter<BaseTreeItem| undefined | null | void> = 
    new vscode.EventEmitter<BaseTreeItem| undefined | null | void>();
  public readonly onDidChangeTreeData: vscode.Event<BaseTreeItem| undefined | null | void> = 
    this._onDidChangeTreeData.event;

  public set Config(newConfig:IotConfiguration){
    this._config=newConfig;    
    //devices
    this.RootItems.forEach(item =>
      {	                
        item.Config=newConfig;        
      });
    //
    this.RefreshsFull();
  }

  private _statusBarItem:vscode.StatusBarItem;
  private _devices: Array<IotDevice>;
  private _workspaceDirectory:string|undefined;

  constructor(    
    statusBarItem:vscode.StatusBarItem,
    outputChannel:vscode.OutputChannel,
    config:IotConfiguration,
    devices: Array<IotDevice>,
    workspaceDirectory:string|undefined
  ) {            
      this._statusBarItem=statusBarItem;
      this.OutputChannel=outputChannel;     
      //Set config
      this._config=config;
      this._devices=devices;
      this._workspaceDirectory=workspaceDirectory;
      //Recovery devices
      //if(workspaceDirectory) this.RecoveryLaunchs(devices,workspaceDirectory);  
  }

  public getTreeItem(element: BaseTreeItem): vscode.TreeItem | Thenable<BaseTreeItem> {
    return element;
  }  
  
  public getChildren(element?: BaseTreeItem): Thenable<BaseTreeItem[]> {
    if (element) {
      //Creating a child element
      let objArray: Array<BaseTreeItem> =[];
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

  public RefreshsFull(): void {
    //Clear
    this.RootItems = [];
    if(this._workspaceDirectory) this.RecoveryLaunchs(this._devices,this._workspaceDirectory);
    //
    this._onDidChangeTreeData.fire();    
  }

  public async AddConfiguration(workspaceDirectory:string, projectPath:string,device: IotDevice): Promise<IotResult> {
    this.ShowStatusBar("Create a configuration");    
    let configuration = new IotLaunchConfiguration(this.Config);
    let result = await configuration.Create(workspaceDirectory,projectPath,device);
    if(result.Status==StatusResult.Ok)
      {
        this.RootItems.push(configuration);
        //Refresh treeView
        this.Refresh();
      }    
    this.HideStatusBar();
    return Promise.resolve(result);    
  }
        
  private async ShowStatusBar(textStatusBar:string): Promise<void>{      
    this._isStopStatusBar=false;
    //  
    if(this._statusBarItem)
      {
        this.SetTextStatusBar(textStatusBar);
        //        
        this._statusBarItem.text=this._statusBarText;      
        this._statusBarItem.tooltip=this._statusBarText;
        this._statusBarItem.show();
        let progressChars: string = '|/-\\';
        let lengthProgressChars = progressChars.length;
        let posProgressChars:number=0;
        
          do { 				
            let chars = progressChars.charAt(posProgressChars);
            this._statusBarItem.text = chars + " " + this._statusBarText;
            this._statusBarItem.tooltip=this._statusBarText;
            posProgressChars=posProgressChars+1;
            if(posProgressChars>lengthProgressChars) posProgressChars=0; 
            await IoTHelper.Sleep(150);
           } 
           while(!this._isStopStatusBar)
      }    
    }

  private async SetTextStatusBar(textStatusBar:string): Promise<void>{
    if(this._statusBarItem)
    {
      this._statusBarText=textStatusBar;      
    }    
  }
  
  private async HideStatusBar(): Promise<void>{
    if(this._statusBarItem)
    {
      this._isStopStatusBar=true;						
      this._statusBarItem.hide();						
    }    
  }

  private async RecoveryLaunchs(devices: Array<IotDevice>,workspaceDirectory:string): Promise<void>{    
    //Clear
    this.RootItems = [];
    //Recovery launchs from config in JSON format
    //fromJSON(jsonObj:any,devices: Array<IotDevice>,workspaceDirectory:string):any{
    this.ShowStatusBar("Reading extension settings");
    //check folder .vscode with launch.json
    //launch.json
    const pathLaunchFile=workspaceDirectory+"\\.vscode\\launch.json";    
    if (!fs.existsSync(pathLaunchFile))
    {
      //end processing
      this.HideStatusBar();
      return;
    }     
    //fromJSON
    try
    {
      let datafile:string= fs.readFileSync(pathLaunchFile, 'utf8');
      datafile=IoTHelper.DeleteComments(datafile);     
      var obj = JSON.parse(datafile);
      //Recovery of every Launch    
      let index=0;    
      do { 				
            let jsonLaunch=obj.configurations[index];
            if(jsonLaunch)
            {
              if(jsonLaunch.fastiotId)
              {
                //parse
                let launch = new IotLaunchConfiguration(this.Config);
                const resultBool=launch.FromJSON(jsonLaunch,devices,workspaceDirectory);
                if(resultBool){
                  launch.collapsibleState=vscode.TreeItemCollapsibleState.Collapsed;
                  this.RootItems.push(launch);
                }              
              }            
              //next position
              index=index+1;
            }else break;      
    } 
    while(true)
    //Refresh treeView
    this.Refresh();
    //end processing
    this.HideStatusBar();
    }
    catch (err:any)
    {
      console.log(`Error. Exec.Output: ${err}`);
      //end processing
      this.HideStatusBar();
      return;
    }
  }  

  public async RenameConfiguration(item:IotLaunchConfiguration,newLabel:string): Promise<boolean> {
    if(this.RootItems.find(x=>x.label==newLabel)) return Promise.resolve(false);     
    let configuration = this.FindbyIdConfiguration(<string>item.IdConfiguration);
    if(configuration){
      configuration.Rename(newLabel);      
      //
      return Promise.resolve(true);   
    }
    return Promise.resolve(false);   
  }  

  public FindbyIdConfiguration(idConfiguration:string): IotLaunchConfiguration|undefined {
    let configuration = this.RootItems.find(x=>x.IdConfiguration==idConfiguration);
    return configuration;    
  }

  public async DeleteConfiguration(idConfiguration:string): Promise<boolean> {
    let configuration=this.FindbyIdConfiguration(idConfiguration);
    if(configuration){
      configuration.Remove();
      const index=this.RootItems.indexOf(configuration);
      this.RootItems.splice(index,1);      
      return Promise.resolve(true);   
    }
    return Promise.resolve(false);   
  }  

  public async RebuildConfiguration(idConfiguration:string): Promise<void>
  {
    let configuration=this.FindbyIdConfiguration(idConfiguration);
    if(configuration) configuration.Rebuild();
  }

  public async CreateProject(device:IotDevice,template:IotTemplate, dstPath:string,nameProject:string,objJSON:any):Promise<IotResult> {
    const result=template.CreateProject(device,this.Config,dstPath,nameProject,objJSON);
    //result
    return Promise.resolve(result);  
  }
}
