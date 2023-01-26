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
  public TypeProject:string="";
  public PathProject:string="";
  public IdGroup:string="";
  public NumberInGroup:number=0;
  public IdTemplate:string="";

  public Options: IotLaunchOptions;  
  public Environments: IotLaunchEnvironment; 
  public Config:IotConfiguration;
  public WorkspaceDirectory:string;
  //DELL
  //??? config
  constructor(config:IotConfiguration,workspaceDirectory:string
    ){
      super("Configuration",undefined, undefined,vscode.TreeItemCollapsibleState.Expanded);
      this.Config=config;
      this.WorkspaceDirectory=workspaceDirectory;
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

  public FromJSON(jsonObj:any,devices: Array<IotDevice>):boolean{
    try
    {        
      //verification
      if((!jsonObj.fastiotIdDevice)||(!jsonObj.fastiotProject)) return false;;
      //find device
      const idDevice:string=jsonObj.fastiotIdDevice;
      const device=devices.find(x=>x.IdDevice==idDevice);
      //if(!device) return false;
      //find project
      //const projectPath=this.WorkspaceDirectory+"\\"+jsonObj.fastiotProject;
      //if (!fs.existsSync(projectPath)) false;      
      //Recovery
      //reading variables
      if(device) this.Device=device;
      this.IdLaunch=jsonObj.fastiotIdLaunch;
      this.TypeProject=jsonObj.fastiotTypeProject;
      this.PathProject=jsonObj.fastiotProject;
      this.IdGroup=jsonObj.fastiotIdGroup;
      this.NumberInGroup=<number>jsonObj.fastiotNumberInGroup;
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
    const pathLaunchFile=<string>this.WorkspaceDirectory+"\\.vscode\\launch.json";
    if (!fs.existsSync(pathLaunchFile)) return result;
    //Change in file
    let datafile= fs.readFileSync(pathLaunchFile, 'utf8');
    datafile=IoTHelper.DeleteComments(datafile);
    let jsonLaunch = JSON.parse(datafile);
    //    
    jsonLaunch.configurations.forEach((element:any) => {
      const fastiotId = element.fastiotIdLaunch;
      if(this.IdLaunch==fastiotId)
      {
        this.label=this.tooltip=element.name=newLabel;
        result=true;
        //write file
        fs.writeFileSync(pathLaunchFile,JSON.stringify(jsonLaunch,null,2));
      }
    });        
    return result;
  }

  public Remove()
  {
    //deleting related configuration
    //launch.json
    //check launch.json
    const pathLaunchFile=<string>this.WorkspaceDirectory+"\\.vscode\\launch.json";
    if (fs.existsSync(pathLaunchFile)){
      //delete
      let datafile= fs.readFileSync(pathLaunchFile, 'utf8');
      datafile=IoTHelper.DeleteComments(datafile); 
      let jsonLaunch = JSON.parse(datafile);            
      //filter
      jsonLaunch.configurations=jsonLaunch.configurations.filter((e:any) => e.fastiotIdLaunch !=this.IdLaunch);
      //write file
      fs.writeFileSync(pathLaunchFile,JSON.stringify(jsonLaunch,null,2));      
    }    
    //deleting related tasks
    //tasks.json
    const pathTasksFile=<string>this.WorkspaceDirectory+"\\.vscode\\tasks.json";
    if (fs.existsSync(pathTasksFile))    
    {
      let dataFile= fs.readFileSync(pathTasksFile, 'utf8');
      dataFile=IoTHelper.DeleteComments(dataFile); 
      let jsonTasks = JSON.parse(dataFile);
      //filter. fastiot-67c94b5e
      const taskLabel=`fastiot-${this.IdLaunch}`;
      jsonTasks.tasks=jsonTasks.tasks.filter((e:any) => !e.label.includes(taskLabel));      
      //write file            
      fs.writeFileSync(pathTasksFile,JSON.stringify(jsonTasks,null,2));
   }    
  }
  //DELL
  public Rebuild()
  {
    //deleting related configuration and tasks
    this.Remove();            
    //creating a configuration    
    //this.CreateLaunch(<string>this.label);    
    //creating a tasks
    //this.CreateTasks();
  }
  
  iconPath = {
    light: path.join(__filename, '..', '..', 'resources', 'light', 'lanch.svg'),
    dark: path.join(__filename, '..', '..', 'resources', 'dark', 'lanch.svg')
  };
}
