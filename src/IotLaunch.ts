import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {BaseTreeItem} from './BaseTreeItem';
import {IotDeviceAccount} from './IotDeviceAccount';
import {IotDeviceInformation} from './IotDeviceInformation';
 
import {IotConfiguration} from './Configuration/IotConfiguration';
import {IotResult,StatusResult } from './IotResult';
import {v4 as uuidv4} from 'uuid';
import {IotItemTree } from './IotItemTree';
import { config } from 'process';
import SSH2Promise from 'ssh2-promise';
import {IotDevice} from './IotDevice';
import {IotLaunchOptions} from './IotLaunchOptions';
import {IotLaunchEnvironment} from './IotLaunchEnvironment';

import {IoTHelper} from './Helper/IoTHelper';
import {launchHelper} from './Helper/launchHelper';
//

export class IotLaunch extends BaseTreeItem {  
  public Parent: undefined;
  public Childs: Array<IotLaunchOptions| IotLaunchEnvironment>=[];
  public Device: IotDevice| undefined;
  
  public IdLaunch:string="";
  public PathProject:string="";
  public IdTemplate:string="";

  public Options: IotLaunchOptions;  
  public Environments: IotLaunchEnvironment; 
  public WorkspaceDirectory:string;

  public readonly LaunchFilePath:string;
  public readonly TasksFilePath:string;
  public get existsLaunchTasks(): boolean {
    return (fs.existsSync(this.LaunchFilePath)&&fs.existsSync(this.TasksFilePath));}

  constructor(workspaceDirectory:string){
    super("Configuration",undefined, undefined,vscode.TreeItemCollapsibleState.Expanded);
    this.WorkspaceDirectory=workspaceDirectory;
    this.LaunchFilePath=<string>this.WorkspaceDirectory+"\\.vscode\\launch.json";
    this.TasksFilePath=<string>this.WorkspaceDirectory+"\\.vscode\\tasks.json";
    //view
    this.contextValue="iotlaunch";
    //
    this.Options = new IotLaunchOptions("Options",undefined,"Options",
      vscode.TreeItemCollapsibleState.Collapsed,this,this);      
    this.Environments = new IotLaunchEnvironment("Environments",undefined,"Environments",
      vscode.TreeItemCollapsibleState.Collapsed,this,this);
    //view
    this.Environments.contextValue="iotenviroments";
    //Added in childs
    this.Childs.push(this.Options);
    this.Childs.push(this.Environments);      
  }

  public GetJsonLaunch():IotResult{
    const result=this.GetJsonFile(this.LaunchFilePath);
    return result;
  }

  public GetJsonTasks():IotResult{
    const result=this.GetJsonFile(this.TasksFilePath);
    return result;
  }

  private GetJsonFile(filePath:string):IotResult{
    let result:IotResult;
    try {
      if(this.existsLaunchTasks){
        let dataFile:string= fs.readFileSync(filePath, 'utf8');
        dataFile=IoTHelper.DeleteComments(dataFile);
        let json = JSON.parse(dataFile);
        result= new IotResult(StatusResult.Ok,undefined,undefined);
        result.returnObject=json;
        return result;
      }else {
        result= new IotResult(StatusResult.Error,`Files launch.json and tasks.json not found in folder /.vscode. Project is a ${this.PathProject}`,undefined);
        result.tag="404";
      }
    } catch (err: any){
      result= new IotResult(StatusResult.Error,`GetJsonFile ${filePath}`,err);
    }
    return result;
  }

  public SaveLaunch(json:any):IotResult{
    return this.SaveFile(this.LaunchFilePath,json);
  }

  public SaveTasks(json:any):IotResult{
    return this.SaveFile(this.TasksFilePath,json);
  }

  private SaveFile(filePath:string,json:any):IotResult{
    let result:IotResult;
    try {
      const datafile = JSON.stringify(json,null,2);
      //write file
      fs.writeFileSync(filePath,datafile);
      result=new IotResult(StatusResult.Ok, undefined,undefined);
    } catch (err: any){
      result= new IotResult(StatusResult.Error,`SaveFile filePath: ${filePath}, json: ${json}`,err); 
    }
    return result; 
  }

  public FromJSON(jsonObj:any,devices: Array<IotDevice>):IotResult{
    let result:IotResult;
    try
    {        
      //verification
      if((!jsonObj.fastiotIdDevice)||(!jsonObj.fastiotProject))
        return new IotResult(StatusResult.Error,`Tags fastiotIdDevice and fastiotProject not found in json: ${jsonObj}`,undefined);
      //find device
      const idDevice:string=jsonObj.fastiotIdDevice;
      const device=devices.find(x=>x.IdDevice==idDevice);
      //reading variables
      if(device) this.Device=device;
      this.IdLaunch=jsonObj.fastiotIdLaunch;
      this.PathProject=jsonObj.fastiotProject;
      this.IdTemplate=jsonObj.fastiotIdTemplate;
      //Options
      this.Options.Build();
      //Environments
      if(jsonObj.env) this.Environments.FromJSON(jsonObj.env);  
      //Label-name
      this.label=this.tooltip=jsonObj.name;
      result=new IotResult(StatusResult.Ok, undefined,undefined);
    }
    catch (err:any)
    {
      result=new IotResult(StatusResult.Error,`Launch FromJSON. jsonObj: ${jsonObj}`,err);
    }
    return result;
  }

  public Refresh() {              
    this.Options.Build();    
    this.Environments.Build();    
  }

  public Rename(newLabel:string): IotResult {
    let result:IotResult;
    try {
      //Change in file
      result = this.GetJsonLaunch();
      if(result.Status==StatusResult.Error) return result;
      let jsonLaunch = result.returnObject;
      result= new IotResult(StatusResult.Error,`Launch not found. Name: ${this.IdLaunch}`,undefined);
      //change
      jsonLaunch.configurations.forEach((element:any) => {
        const fastiotId = element.fastiotIdLaunch;
        if(this.IdLaunch==fastiotId)
        {
          element.name=newLabel;
          //write file
          result=this.SaveLaunch(jsonLaunch);
          return;
        }
      });
    } catch (err: any){
      result= new IotResult(StatusResult.Error,`Rename launch. Name: ${this.IdLaunch}`,err);
    }
    return result;
  }

  public Remove():IotResult
  {
    let result:IotResult;
    try {
      //deleting related configuration
      //launch.json
      result = this.GetJsonLaunch();
      if(result.Status==StatusResult.Error) return result;
      let json = result.returnObject;
      //filter
      json.configurations=json.configurations.filter((e:any) => e.fastiotIdLaunch !=this.IdLaunch);
      //write file
      result = this.SaveLaunch(json);     
      if(result.Status==StatusResult.Error) return result;
      //deleting related tasks
      //tasks.json
      result = this.GetJsonTasks();
      if(result.Status==StatusResult.Error) return result;
      json = result.returnObject;
      //filter. fastiot-67c94b5e
      const taskLabel=`fastiot-${this.IdLaunch}`;
      json.tasks=json.tasks.filter((e:any) => !e.label.includes(taskLabel));
      //write file
      result = this.SaveTasks(json);  
    } catch (err: any){
      result= new IotResult(StatusResult.Error,`Launch removal. IdLaunch: ${this.IdLaunch}`,err);
    }
    return result; 
  }

  iconPath = {
    light: path.join(__filename, '..', '..', 'resources', 'light', 'lanch.svg'),
    dark: path.join(__filename, '..', '..', 'resources', 'dark', 'lanch.svg')
  };
}
