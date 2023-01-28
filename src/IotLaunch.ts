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

  public GetJsonLaunch():any|undefined{
    const json=this.GetJsonFile(this.LaunchFilePath);
    return json;
  }

  public GetJsonTasks():any|undefined{
    const json=this.GetJsonFile(this.TasksFilePath);
    return json;
  }

  private GetJsonFile(filePath:string):any|undefined{
    if(this.existsLaunchTasks){
      let dataFile:string= fs.readFileSync(filePath, 'utf8');
      dataFile=IoTHelper.DeleteComments(dataFile);
      let json = JSON.parse(dataFile);
      return json;
    }else return undefined;
  }

  public SaveLaunch(json:any){
    this.SaveFile(this.LaunchFilePath,json);
  }

  public SaveTasks(json:any){
    this.SaveFile(this.TasksFilePath,json);
  }

  private SaveFile(filePath:string,json:any){
    const datafile = JSON.stringify(json,null,2);
    //write file
    fs.writeFileSync(filePath,datafile); 
  }

  public FromJSON(jsonObj:any,devices: Array<IotDevice>):boolean{
    try
    {        
      //verification
      if((!jsonObj.fastiotIdDevice)||(!jsonObj.fastiotProject)) return false;;
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
    }
    catch (err)
    {
      console.log(`Error. Exec.Output: ${err}`);
      return false;
    }
    return true;
  }

  public Refresh() {              
    this.Options.Build();    
    this.Environments.Build();    
  }

  public Rename(newLabel:string): boolean {    
    let result:boolean=false;
    newLabel=IoTHelper.StringTrim(newLabel);
    if(newLabel=="") return false;
    //check launch.json
    if (!fs.existsSync(this.LaunchFilePath)) return result;
    //Change in file
    let jsonLaunch = this.GetJsonLaunch();
    //    
    jsonLaunch.configurations.forEach((element:any) => {
      const fastiotId = element.fastiotIdLaunch;
      if(this.IdLaunch==fastiotId)
      {
        this.label=this.tooltip=element.name=newLabel;
        result=true;
        //write file
        this.SaveLaunch(jsonLaunch);
      }
    });        
    return result;
  }

  public Remove()
  {
    //deleting related configuration
    //launch.json
    //check launch.json
    if (this.existsLaunchTasks){
      //delete
      let jsonLaunch = this.GetJsonLaunch();
      //filter
      jsonLaunch.configurations=jsonLaunch.configurations.filter((e:any) => e.fastiotIdLaunch !=this.IdLaunch);
      //write file
      this.SaveLaunch(jsonLaunch);     
    }    
    //deleting related tasks
    //tasks.json
    if (this.existsLaunchTasks)    
    {
      let jsonTasks = this.GetJsonTasks();
      //filter. fastiot-67c94b5e
      const taskLabel=`fastiot-${this.IdLaunch}`;
      jsonTasks.tasks=jsonTasks.tasks.filter((e:any) => !e.label.includes(taskLabel));
      //write file
      this.SaveTasks(jsonTasks);
   }    
  }

  iconPath = {
    light: path.join(__filename, '..', '..', 'resources', 'light', 'lanch.svg'),
    dark: path.join(__filename, '..', '..', 'resources', 'dark', 'lanch.svg')
  };
}
