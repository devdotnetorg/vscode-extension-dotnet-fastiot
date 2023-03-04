import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {BaseTreeItem} from './BaseTreeItem';
import {IotDevice} from './IotDevice';
import {LaunchNode} from './LaunchNode';
import {IoTHelper} from './Helper/IoTHelper';
import {IotResult,StatusResult } from './IotResult';
import {IotConfiguration} from './Configuration/IotConfiguration';
import {IotTemplate} from './Templates/IotTemplate';

export class TreeDataLaunchsProvider implements vscode.TreeDataProvider<BaseTreeItem> {    
  public RootItems:Array<LaunchNode>=[];

  public Config: IotConfiguration;
    
  private _onDidChangeTreeData: vscode.EventEmitter<BaseTreeItem| undefined | null | void> = 
    new vscode.EventEmitter<BaseTreeItem| undefined | null | void>();
  public readonly onDidChangeTreeData: vscode.Event<BaseTreeItem| undefined | null | void> = 
    this._onDidChangeTreeData.event;

  private _devices: Array<IotDevice>;
  private _workspaceDirectory:string;

  constructor(
    config:IotConfiguration,
    devices: Array<IotDevice>,
    workspaceDirectory:string|undefined
  ) {
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
      const launchBase= new LaunchNode(this._workspaceDirectory);
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
                let launch = new LaunchNode(this._workspaceDirectory);
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

  public async RenameLaunch(item:LaunchNode,newLabel:string): Promise<IotResult> {
    let result:IotResult;
    result=this.GetLaunchbyIdLaunch(item.IdLaunch);
    if(result.Status!=StatusResult.Ok) return Promise.resolve(result);
    let launch=<LaunchNode>result.returnObject;
    if(launch){
      result=launch.Rename(newLabel);
    }else result = new IotResult(StatusResult.Error,`Launch not found IdLaunch:${item.IdLaunch}`);
    //result
    return Promise.resolve(result);
  }

  public FindbyIdLaunchInTree(idLaunch:string): LaunchNode|undefined {
    let launch = this.RootItems.find(x=>x.IdLaunch==idLaunch);
    return launch;    
  }

  public GetLaunchbyIdLaunch(idLaunch:string): IotResult {
    let result:IotResult;
    let launch = new LaunchNode(this._workspaceDirectory);
    try {
      result=launch.GetJsonLaunch();
      if(result.Status==StatusResult.Error) return result;
      const jsonLaunch=result.returnObject;
      result= new IotResult(StatusResult.No,`Not found. idLaunch: ${idLaunch}`);
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
    let launch=<LaunchNode>result.returnObject;
    if(launch){
      result=launch.Remove();  
    }else result = new IotResult(StatusResult.Error,`Launch not found IdLaunch:${idLaunch}`);
    //result
    return Promise.resolve(result);
  }  

  public async RebuildLaunch(idLaunch:string): Promise<IotResult>
  {
    let result:IotResult;
    result=this.GetLaunchbyIdLaunch(idLaunch);
    if(result.Status!=StatusResult.Ok) return Promise.resolve(result);
    let launch=<LaunchNode>result.returnObject;
    //--------------Checks--------------
    //check device
    if(!launch.Device) {
      result= new IotResult(StatusResult.Error,`Missing device for idLaunch: ${idLaunch}`);
      return Promise.resolve(result);
    }
    //check project
    const projectMainfilePath=IoTHelper.ReverseSeparatorLinuxToWin(`${this._workspaceDirectory}${launch.PathProject}`);
    if (!fs.existsSync(projectMainfilePath)) {
      result= new IotResult(StatusResult.Error,`Missing project: ${projectMainfilePath}`);
      return Promise.resolve(result);
    }
    //check template
    const template = this.Config.Templates.FindbyId(launch.IdTemplate);
    if (!template) {
      result= new IotResult(StatusResult.Error,`Missing template: ${launch.IdTemplate}`);
      return Promise.resolve(result);
    }
    //--------------Main--------------
    //get json linked Launchs
    result=launch.GetJsonLaunch();
    if(result.Status==StatusResult.Error) return Promise.resolve(result);
    let jsonLaunch=<any>result.returnObject;
    let jsonLinkedLaunchs=jsonLaunch.configurations.filter((e:any) => e.fastiotIdLaunch);
    jsonLinkedLaunchs=jsonLinkedLaunchs.filter((e:any) => e.fastiotIdLaunch.includes(launch.IdLaunch.substring(0,8)));
    //create a Message and get IotLaunch LinkedLaunchs
    let LinkedLaunchs:Array<LaunchNode>=[];
    let msg="\n";
    let index=1;
    jsonLinkedLaunchs.forEach((item:any) => {
      let launchItem = new LaunchNode(this._workspaceDirectory);
      result=launchItem.FromJSON(item,this._devices);
      if(result.Status==StatusResult.Error) return Promise.resolve(result);
      LinkedLaunchs.push(launchItem);
      //
      msg= msg + `${index}) ${launchItem.IdLaunch} ${launchItem.label}\n`;
      index++;
    });
    vscode.window.showInformationMessage(`Rebuilding Launches: ${msg}`);
    //remove linked launchs
    LinkedLaunchs.forEach((item) => {
      result=item.Remove();
      if(result.Status==StatusResult.Error) return Promise.resolve(result);
    });
    //Add Configuration Vscode
    let values:Map<string,string>= new Map<string,string>();
    //Preparing values
    const baseName=path.basename(projectMainfilePath);
    const projectName=baseName.substring(0,baseName.length-template.Attributes.ExtMainFileProj.length);
    values.set("%{project.mainfile.path.full.aswindows}",projectMainfilePath);
    values.set("%{project.name}",projectName);
    result = template.AddConfigurationVscode(launch.Device,this.Config,this._workspaceDirectory,values);
    if(result.Status==StatusResult.Error) return Promise.resolve(result);
    const newLaunchId=result.tag;
    //--------------End of process--------------
    //Name and env recovery
    result = launch.GetJsonLaunch();
    if(result.Status==StatusResult.Error) return Promise.resolve(result);
    let jsonNewLaunch=result.returnObject;
    //launchs
    index=0; 
    do {
      let newItemLaunch=jsonNewLaunch.configurations[index];
      if(newItemLaunch)
      {
        if(newItemLaunch.fastiotIdLaunch&&newItemLaunch.fastiotIdLaunch.includes(newLaunchId)){
          const oldItemLaunch=jsonLinkedLaunchs.find((x:any)=>x.fastiotIdLaunch.substring(8)==newItemLaunch.fastiotIdLaunch.substring(8));
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
        index=index+1;
      }else break;      
    } 
    while(true)
    //result
    result=launch.SaveLaunch(jsonNewLaunch);
    if(result.Status==StatusResult.Error) return Promise.resolve(result);
    return Promise.resolve(result);
  }
  // Create project from a template
  public async CreateProject(device:IotDevice,template:IotTemplate, dstPath:string,values:Map<string,string>):Promise<IotResult> {
    const result=template.CreateProject(device,this.Config,dstPath,values);
    //result
    return Promise.resolve(result);  
  }
  //Add Launch
  public async AddLaunch(device:IotDevice,template:IotTemplate,values:Map<string,string>):Promise<IotResult> {
    const result=template.AddConfigurationVscode(device,this.Config,this._workspaceDirectory,values);
    //result
    return Promise.resolve(result);  
  }
}
