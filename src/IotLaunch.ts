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
      //get launch.json and tasks.json
      //launch.json
      result = this.GetJsonLaunch();
      if(result.Status==StatusResult.Error) return result;
      let jsonLaunch = result.returnObject;
      //tasks.json
      result = this.GetJsonTasks();
      if(result.Status==StatusResult.Error) return result;
      let jsonTasks = result.returnObject;
      //get preLaunchTask
      const launch=jsonLaunch.configurations.find((x:any) => x.fastiotIdLaunch ==this.IdLaunch);
      if(!launch){
        result= new IotResult(StatusResult.Error,`Launch not found. IdLaunch: ${this.IdLaunch}`,undefined);
      }else{
        //Task
        const preLaunchTask=launch.preLaunchTask;
        if(preLaunchTask){
          //delete a task chain
          result= this.DeleteTaskChaine(this.IdLaunch,jsonLaunch,jsonTasks);
          if(result.Status==StatusResult.Error) return result;
          jsonTasks=result.returnObject;
        }
        //Launch
        //filter
        jsonLaunch.configurations=jsonLaunch.configurations.filter((e:any) => e.fastiotIdLaunch !=this.IdLaunch);
        //save
        result = this.SaveLaunch(jsonLaunch);     
        if(result.Status==StatusResult.Error) return result;
        result = this.SaveTasks(jsonTasks); 
        if(result.Status==StatusResult.Error) return result;
      }
    } catch (err: any){
      result= new IotResult(StatusResult.Error,`Launch removal. IdLaunch: ${this.IdLaunch}`,err);
    }
    return result; 
  }

  private DeleteTaskChaine(fastiotIdLaunch:string,jsonLaunch:any,jsonTasks:any):IotResult
  {
    let result:IotResult;
    try {
      result=this.BuildingChainsTasks(jsonLaunch,jsonTasks);
      if(result.Status==StatusResult.Error) return result;
      // key - fastiotIdLaunch, value - labels tasks
      let taskChains:Map<string,string[]>= new Map<string,string[]>();
      taskChains=result.returnObject;
      const tasksChainDelete=taskChains.get(fastiotIdLaunch);
      if(!tasksChainDelete){
        //no tasks to delete
        result= new IotResult(StatusResult.Ok,`No tasks to delete. IdLaunch: ${this.IdLaunch}`,undefined);
        result.returnObject=jsonTasks;
        return result;
      }
      taskChains.delete(fastiotIdLaunch);
      let tasks:string[]=[];
      //get all tasks
      taskChains.forEach((values,key) => {      
        values.forEach((value) => {      
          tasks.push(value);
        });
      });
      //получаем разность массивов
      //для исключения зависимых задач от других Launch
      //tasksChainDelete - массив с задачами для удаления
      //tasks - массив используемых задач другими Launch
      const differenceTasks = tasksChainDelete.filter(x => !tasks.includes(x));
      if(differenceTasks.length==0)
      {
        //no tasks to delete
        result= new IotResult(StatusResult.Ok,`No tasks to delete. IdLaunch: ${this.IdLaunch}`,undefined);
        result.returnObject=jsonTasks;
        return result;
      }
      //task delete function
      const removeById = (json:any, label:any) => {
        const requiredIndex = json.findIndex((el:any) => {
          return el.label === String(label);
        });
        if(requiredIndex === -1){
          return false;
        };
        return !!json.splice(requiredIndex, 1);
      };
      //deleting tasks
      differenceTasks.forEach((value) => {
        removeById(jsonTasks.tasks,value);
      });
      //result
      result= new IotResult(StatusResult.Ok,undefined,undefined);
      result.returnObject=jsonTasks;
    } catch (err: any){
      result= new IotResult(StatusResult.Error,`DeleteTaskChaine. IdLaunch: ${this.IdLaunch}`,err);
    }
    return result;
  }

  private BuildingChainsTasks(jsonLaunch:any,jsonTasks:any):IotResult
  {
    let result:IotResult;
    try {
      // key - fastiotIdLaunch, value - labels tasks
      let taskChains:Map<string,string[]>= new Map<string,string[]>();
      //Launch
      jsonLaunch.configurations.forEach((element:any) => {
        const fastiotIdLaunch=element.fastiotIdLaunch;
        const preLaunchTask=element.preLaunchTask;
        if(fastiotIdLaunch&&preLaunchTask)
        {
          //get task chain
          result=this.GetTaskChain(preLaunchTask,jsonTasks);
          if(result.Status==StatusResult.Error) return result;
          if(result.Status==StatusResult.Ok) {
            const taskChain=<string[]>result.returnObject;
            taskChains.set(fastiotIdLaunch,taskChain);
          }
        }
      });
      //
      result=new IotResult(StatusResult.Ok, undefined,undefined);
      result.returnObject=taskChains;
    } catch (err: any){
      result= new IotResult(StatusResult.Error,`DeleteTaskChaine. IdLaunch: ${this.IdLaunch}`,err);
    }
    return result;
  }
  private GetTaskChain(preLaunchTask:string,jsonTasks:any):IotResult
  {
    let result:IotResult;
    try {
      let taskChain:string[]=[];
      let findLabel=preLaunchTask;
      do {
        const task=jsonTasks.tasks.find((x:any) => x.label ==findLabel);
        if(task)
        {
          taskChain.push(task.label);
          const dependsOn=task.dependsOn;
          if (dependsOn) findLabel=dependsOn;else break;
        }else break; 
      } 
      while(true)
      if(taskChain.length>0){
        result=new IotResult(StatusResult.Ok, undefined,undefined);
      }else{
        result=new IotResult(StatusResult.No, undefined,undefined);
      }
      result.returnObject=taskChain;
    } catch (err: any){
      result= new IotResult(StatusResult.Error,`GetTaskChain. IdLaunch: ${this.IdLaunch}`,err);
    }
    return result;
  }
  
  iconPath = {
    light: path.join(__filename, '..', '..', 'resources', 'light', 'lanch.svg'),
    dark: path.join(__filename, '..', '..', 'resources', 'dark', 'lanch.svg')
  };
}
