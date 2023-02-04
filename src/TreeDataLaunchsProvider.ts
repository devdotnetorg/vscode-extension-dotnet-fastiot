import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {BaseTreeItem} from './BaseTreeItem';

import { IotDevice } from './IotDevice';
import { IotDeviceAccount } from './IotDeviceAccount';
import { IotDeviceInformation } from './IotDeviceInformation';
import { IotItemTree } from './IotItemTree';
import { IotDevicePackage } from './IotDevicePackage';
import { IotLaunch} from './IotLaunch';
import {IoTHelper} from './Helper/IoTHelper';

import { IotResult,StatusResult } from './IotResult';
import {IotConfiguration} from './Configuration/IotConfiguration';
import {IotTemplate} from './Templates/IotTemplate';

export class TreeDataLaunchsProvider implements vscode.TreeDataProvider<BaseTreeItem> {    
  public RootItems:Array<IotLaunch>=[];

  private _isStopStatusBar:boolean=false;
  private _statusBarText:string="";
  public OutputChannel:vscode.OutputChannel;
  public Config: IotConfiguration;
    
  private _onDidChangeTreeData: vscode.EventEmitter<BaseTreeItem| undefined | null | void> = 
    new vscode.EventEmitter<BaseTreeItem| undefined | null | void>();
  public readonly onDidChangeTreeData: vscode.Event<BaseTreeItem| undefined | null | void> = 
    this._onDidChangeTreeData.event;

  private _statusBarItem:vscode.StatusBarItem;
  private _devices: Array<IotDevice>;
  private _workspaceDirectory:string;

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
      this.Config=config;
      this._devices=devices;
      this._workspaceDirectory=workspaceDirectory ?? "non"; 
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

  public RefreshsFull(): IotResult {
    let result:IotResult;
    result= new IotResult(StatusResult.Ok,undefined,undefined);
    if(this._workspaceDirectory!="non") result = this.RecoveryLaunchs();  
    this.Refresh();
    return result;  
  }
  
  /*
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
   */

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
      //fromJSON(jsonObj:any,devices: Array<IotDevice>,workspaceDirectory:string):any{
      //check folder .vscode with launch.json
      //launch.json
      const launchBase= new IotLaunch(this._workspaceDirectory);
      //fromJSON
      result = launchBase.GetJsonLaunch();
      if(result.Status==StatusResult.Error) return result;  
      let obj=result.returnObject;
      //Recovery of every Launch    
      let index=0;    
      do { 				
            let jsonLaunch=obj.configurations[index];
            if(jsonLaunch)
            {
              if(jsonLaunch.fastiotIdLaunch)
              {
                //parse
                let launch = new IotLaunch(this._workspaceDirectory);
                result=launch.FromJSON(jsonLaunch,this._devices);
                if(result.Status==StatusResult.Ok){
                  launch.collapsibleState=vscode.TreeItemCollapsibleState.Collapsed;
                  this.RootItems.push(launch);
                }
              }            
              //next position
              index=index+1;
            }else break;      
      } 
      while(true)
    }
    catch (err:any)
    {
      result= new IotResult(StatusResult.Error,`RecoveryLaunchs. Path: ${this._workspaceDirectory}`,err);
    }
    //Refresh treeView
    this.Refresh();
    return result;
  }  

  public async RenameLaunch(item:IotLaunch,newLabel:string): Promise<IotResult> {
    let result:IotResult;
    result=this.GetLaunchbyIdLaunch(item.IdLaunch);
    if(result.Status!=StatusResult.Ok) return Promise.resolve(result);
    let launch=<IotLaunch>result.returnObject;
    if(launch){
      result=launch.Rename(newLabel);
    }else result = new IotResult(StatusResult.Error,`Launch not found IdLaunch:${item.IdLaunch}`,undefined);
    //result
    return Promise.resolve(result);
  }

  public FindbyIdLaunchInTree(idLaunch:string): IotLaunch|undefined {
    let launch = this.RootItems.find(x=>x.IdLaunch==idLaunch);
    return launch;    
  }

  public GetLaunchbyIdLaunch(idLaunch:string): IotResult {
    let result:IotResult;
    let launch = new IotLaunch(this._workspaceDirectory);
    try {
      result=launch.GetJsonLaunch();
      if(result.Status==StatusResult.Error) return result;
      const jsonLaunch=result.returnObject;
      result= new IotResult(StatusResult.No,undefined,undefined);
      jsonLaunch.configurations.forEach((element:any) => {
        const fastiotIdLaunch = element.fastiotIdLaunch;
        if(idLaunch==fastiotIdLaunch)
        {
          result=launch.FromJSON(element,this._devices);
          if(result.Status==StatusResult.Error) return result;
          result.returnObject=launch;
          return;
        }
      });
    } catch (err: any){
      result= new IotResult(StatusResult.Error,`GetLaunchbyIdLaunch ${idLaunch}`,err);
    }
    return result;
  }

  public async DeleteLaunch(idLaunch:string): Promise<IotResult> {
    let result:IotResult;
    result=this.GetLaunchbyIdLaunch(idLaunch);
    if(result.Status!=StatusResult.Ok) return Promise.resolve(result);
    let launch=<IotLaunch>result.returnObject;
    if(launch){
      result=launch.Remove();  
    }else result = new IotResult(StatusResult.Error,`Launch not found IdLaunch:${idLaunch}`,undefined);
    //result
    return Promise.resolve(result);
  }  

  public async RebuildLaunch(idLaunch:string): Promise<void>
  {
    /*
    let launch=this.FindbyIdLaunch(idLaunch);
    if(launch){
      //get linked Launchs
      const sourceIdLaunch = launch.IdLaunch ?? "non";
      const jsonLaunch=launch.GetJsonLaunch();
      let linkedLaunchs=jsonLaunch.configurations.filter((e:any) => e.fastiotIdLaunch);
      linkedLaunchs=linkedLaunchs.filter((e:any) => e.fastiotIdLaunch.includes(sourceIdLaunch.substring(0,8)));
      let msg="\n";
      let index=1;
      linkedLaunchs.forEach((item:any) => {
        msg= msg + `${index}) ${item.fastiotIdLaunch} ${item.name}\n`;
        index++;
      });
      vscode.window.showInformationMessage(`Rebuilding Launches: ${msg}`);
      //check device
      const device=this._devices.find(x=>x.IdDevice==launch?.Device?.IdDevice);
      if(!device) {
        vscode.window.showErrorMessage(`Missing device: ${launch?.Device?.IdDevice} ${launch?.Device?.label}`);
        return;
      }
      //check project
      const projectMainfilePath=`${this._workspaceDirectory}\\${launch.PathProject}`;
      if (!fs.existsSync(projectMainfilePath)) {
        vscode.window.showErrorMessage(`Missing project: ${projectMainfilePath}`);
        return;
      }
      //check template
      const template = this.Config.Templates.FindbyId(launch.IdTemplate);
      if (!template) {
        vscode.window.showErrorMessage(`Missing template: ${launch.IdTemplate}`);
        return;
      }
      //remove linked launchs
       
      //let launchs= this.RootItems.filter((e:IotLaunch) => e.IdLaunch.includes(sourceIdLaunch.substring(0,8)));
      //launchs.forEach((item) => {
      //  item.Remove();  
      //});
       
      //Add Configuration Vscode
      let values:Map<string,string>= new Map<string,string>();
      //Preparing values
      const baseName=path.basename(projectMainfilePath);
      const projectName=baseName.substring(0,baseName.length-template.Attributes.ExtMainFileProj.length);
      values.set("%{project.mainfile.path.full.aswindows}",projectMainfilePath);
      values.set("%{project.name}",projectName);
      const result = template.AddConfigurationVscode(device,this.Config,this._workspaceDirectory,values);
      if(result.Status==StatusResult.Ok)
      {
        const newLaunchId=result.tag;
        let jsonNewLaunch = launch.GetJsonLaunch();
        //launchs
        let index=0;
        do {
          let newItemLaunch=jsonNewLaunch.configurations[index];
          if(newItemLaunch)
          {
            if(newItemLaunch.fastiotIdLaunch){
              if(newItemLaunch.fastiotIdLaunch.includes(newLaunchId)){
                //const a0=linkedLaunchs[0].fastiotIdLaunch.substring(8);
                //const a1=linkedLaunchs[1].fastiotIdLaunch.substring(8);
                //const b=newItemLaunch.fastiotIdLaunch.substring(8);

                const oldItemLaunch=linkedLaunchs.find((x:any)=>x.fastiotIdLaunch.substring(8)==newItemLaunch.fastiotIdLaunch.substring(8));
                if(oldItemLaunch)
                {
                  //replace name
                  newItemLaunch.name=oldItemLaunch.name;
                  //replace env
                  if(oldItemLaunch.env){
                    if(newItemLaunch.env){
                      if(JSON.stringify(oldItemLaunch.env)!="{}")
                        newItemLaunch.env=oldItemLaunch.env;
                    }else{
                      newItemLaunch.push(oldItemLaunch.env);
                    }
                  }
                }
              }
            }
            index=index+1;
          }else break;      
        } 
        while(true)
        launch.SaveLaunch(jsonNewLaunch);
      }
    }
  */
  }
  // Create project from a template
  public async CreateProject(device:IotDevice,template:IotTemplate, dstPath:string,values:Map<string,string>):Promise<IotResult> {
    const nameProject= values.get("%{project.name}") ?? "";
    //this.ShowStatusBar(`Create a project ${nameProject} ...`);
    const result=template.CreateProject(device,this.Config,dstPath,values);
    //this.HideStatusBar();
    //result
    return Promise.resolve(result);  
  }
  //Add Launch
  public async AddLaunch(device:IotDevice,template:IotTemplate,values:Map<string,string>):Promise<IotResult> {
    const nameProject= values.get("%{project.name}") ?? "";
    //this.ShowStatusBar(`Create a project ${nameProject} ...`);
    const result=template.AddConfigurationVscode(device,this.Config,this._workspaceDirectory,values);
    //this.HideStatusBar();
    //result
    return Promise.resolve(result);  
  }
}
