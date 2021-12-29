import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {BaseTreeItem} from './BaseTreeItem';
import {IotDeviceAccount} from './IotDeviceAccount';
import {IotDeviceInformation} from './IotDeviceInformation';
 
import {IotConfiguration } from './IotConfiguration';
import {IotResult,StatusResult } from './IotResult';
import {v4 as uuidv4} from 'uuid';
import {IotItemTree } from './IotItemTree';
import { config } from 'process';
import SSH2Promise from 'ssh2-promise';
import {IotDevice} from './IotDevice';
import {IotLaunchOptions} from './IotLaunchOptions';
import {IotLaunchEnvironment} from './IotLaunchEnvironment';
import {IotLaunchProject} from './IotLaunchProject';

import {GetUniqueLabel,MakeDirSync,ReverseSeparatorReplacement} from './IoTHelper';
//

export class IotLaunchConfiguration extends BaseTreeItem {  
  public Parent: undefined;
  public Childs: Array<IotLaunchOptions| IotLaunchEnvironment>=[];
  public Device: IotDevice| undefined;
  
  public IdConfiguration:string="";
    
  public Project: IotLaunchProject;  
  public Options: IotLaunchOptions;  
  public Environments: IotLaunchEnvironment; 
  public Config:IotConfiguration 

  constructor(config:IotConfiguration
    ){
      super("Configuration",undefined, undefined,vscode.TreeItemCollapsibleState.Expanded);
      this.Config=config;
      this.CreateGuid();
      //view
      this.contextValue="iotconfiguration";
      //
      this.Project= new IotLaunchProject();
      this.Options = new IotLaunchOptions("Options",undefined,"Options",
        vscode.TreeItemCollapsibleState.Collapsed,this,this,undefined);      
      this.Environments = new IotLaunchEnvironment("Environments",undefined,"Environments",
        vscode.TreeItemCollapsibleState.Collapsed,this,this);
      //view
      this.Environments.contextValue="iotenviroments"; 
      this.Environments.Add("FASTIOT","easy");
      this.Environments.Build();
      //Added in childs
      this.Childs.push(this.Options);
      this.Childs.push(this.Environments);      
    }
  
  public CreateGuid()
  {
    const guid = uuidv4();
    this.IdConfiguration=guid.substr(0,8);
  }
  
  public async Create(workspaceDirectory:string, projectPath:string,device: IotDevice
  ): Promise<IotResult>{    
    let result = new IotResult(StatusResult.None,undefined,undefined);
    try
    {        
      //defining variables to fill      
      //Project
      this.Project.Build(workspaceDirectory,projectPath);
      //Device
      this.Device=device;
      //Options
      this.Options.Device=this.Device;
      this.Options.Build();      
      //Set label
      const labelConfiguration=
        `.NET Remote Launch on ${(<IotDevice>this.Device).label} `+
        `(${(<IotDevice>this.Device).Information.BoardName}, `+
        `${(<IotDevice>this.Device).Account.UserName})`;
      //Create files .vscode      
      result=await this.CreateLaunch(labelConfiguration);
      if(result.Status==StatusResult.Error) return Promise.resolve(result);
      result=await this.CreateTasks();
    }
    catch (err:any)
    {
      console.log(`Error. Exec.Output: ${err}`);
      result=new IotResult(StatusResult.Error,`Error while creating configuration`,err);
    }
    //
    return Promise.resolve(result);   
  }

  public FromJSON(jsonObj:any,devices: Array<IotDevice>,workspaceDirectory:string):boolean{
    try
    {        
      //verification
      if((!jsonObj.fastiotIdDevice)||(!jsonObj.fastiotProject)) return false;;
      //find device
      const idDevice:string=jsonObj.fastiotIdDevice;
      const device=devices.find(x=>x.IdDevice==idDevice);
      if(!devices) return false;
      //find project
      const projectPath=workspaceDirectory+"\\"+jsonObj.fastiotProject;
      if (!fs.existsSync(projectPath)) false;      
      //Recovery
      //fastiotId
      this.IdConfiguration=jsonObj.fastiotId;      
      //Project-fastiotProject
      this.Project.Build(workspaceDirectory,projectPath);
      //Device-fastiotIdDevice
      this.Device=device;
      //Options
      this.Options.Device=this.Device;
      this.Options.Build();
      //Label-name
      this.label=this.tooltip=jsonObj.name;
      //env
      this.Environments.FromJSON(jsonObj.env);      
      //
    }
    catch (err)
    {
      console.log(`Error. Exec.Output: ${err}`);
      return false;
    }
    return true;
  }

  private CreateLabel(jsonLaunch:any,nameConfiguration:string)
  {
    //Rename. checking for matching names.
    let arrayNameConf: Array<string>=[];
    jsonLaunch.configurations.forEach((element:any) => {
      arrayNameConf.push(element.name);
    });    
    //Label    
    nameConfiguration=GetUniqueLabel(nameConfiguration,'#',undefined,arrayNameConf);    
    this.label=this.tooltip=nameConfiguration;
  }

  private CreateLaunch(nameConfiguration:string):Promise<IotResult> {
    try
    {
      //create folder .vscode
      MakeDirSync(<string>this.Project.WorkspaceDirectory+"\\.vscode");
      //check launch.json
      const pathLaunchFile=<string>this.Project.WorkspaceDirectory+"\\.vscode\\launch.json";
      if (!fs.existsSync(pathLaunchFile))
      {
        //create launch.json
        let datafile:string= fs.readFileSync(`${this.Config.PathFolderExtension}\\vscodetemplates\\launch.json`, 'utf8');
        datafile=this.MergeDictionaryWithJSON(this.Options.MergeDictionary,datafile);      
        fs.writeFileSync(pathLaunchFile,datafile);
      }    
      //Preparation insert_configuration.json
      let datafile:string= fs.readFileSync(`${this.Config.PathFolderExtension}\\vscodetemplates\\insert_configuration.json`,
        'utf8');
      let insertConf=this.MergeDictionaryWithJSON(this.Options.MergeDictionary,datafile);    
      let jsonInsertConf = JSON.parse(insertConf); 
      //Add in file
      datafile= fs.readFileSync(pathLaunchFile, 'utf8');
      let jsonLaunch = JSON.parse(datafile);
      //Label
      this.CreateLabel(jsonLaunch,nameConfiguration);    
      //this.options.build();
      jsonInsertConf.name=this.label;    
      //Enviroments
      const envJSON=this.Environments.ToJSON();
      jsonInsertConf.env=envJSON;
      //Push
      jsonLaunch.configurations.push(jsonInsertConf);
      //write file
      fs.writeFileSync(pathLaunchFile,JSON.stringify(jsonLaunch,null,2));
    }
    catch (err:any)
     {
       console.log(`Error. Exec.Output: ${err}`);
       return Promise.resolve(new IotResult(StatusResult.Error,`Error while creating configuration.
        launch.json file creation issue. Try deleting the launch.json file and retrying the task.`,err));
     }
    return Promise.resolve(new IotResult(StatusResult.Ok,undefined,undefined));
  }
  
  private CreateTasks():Promise<IotResult> {
    try
    { 
      //check tasks.json
      const pathTasksFile=<string>this.Project.WorkspaceDirectory+"\\.vscode\\tasks.json";
      if (!fs.existsSync(pathTasksFile))    
      {
        //create tasks.json
        let dataFile= fs.readFileSync(`${this.Config.PathFolderExtension}\\vscodetemplates\\tasks.json`, 'utf8');
        dataFile=this.MergeDictionaryWithJSON(this.Options.MergeDictionary,dataFile);
        fs.writeFileSync(pathTasksFile,dataFile);      
      }
      //Preparation Tasks
      const pathTemplates=`${this.Config.PathFolderExtension}\\vscodetemplates`;
      //insert_task_build_linux.json
      let dataFile:string= fs.readFileSync(`${pathTemplates}\\insert_task_build_linux.json`, 'utf8');
      let insertData=this.MergeDictionaryWithJSON(this.Options.MergeDictionary,dataFile);
      const jsonInsert_build_linux = JSON.parse(insertData);
      //insert_task_copy_app_to_device.json
      dataFile= fs.readFileSync(`${pathTemplates}\\insert_task_copy_app_to_device.json`, 'utf8');
      insertData=this.MergeDictionaryWithJSON(this.Options.MergeDictionary,dataFile);
      const jsonInsert_copy_app_to_device = JSON.parse(insertData);
      //insert_task_create_folder.json
      dataFile= fs.readFileSync(`${pathTemplates}\\insert_task_create_folder.json`, 'utf8');
      insertData=this.MergeDictionaryWithJSON(this.Options.MergeDictionary,dataFile);
      const jsonInsert_create_folder = JSON.parse(insertData);        
      //Add in file
      dataFile= fs.readFileSync(pathTasksFile, 'utf8');
      let jsonTasks = JSON.parse(dataFile);
      //Push    
      jsonTasks.tasks.push(jsonInsert_build_linux);    
      jsonTasks.tasks.push(jsonInsert_create_folder);
      jsonTasks.tasks.push(jsonInsert_copy_app_to_device);    
      //write file            
      fs.writeFileSync(pathTasksFile,JSON.stringify(jsonTasks,null,2));
    }
    catch (err:any)
    {
      console.log(`Error. Exec.Output: ${err}`);
      return Promise.resolve(new IotResult(StatusResult.Error,`Error while creating configuration.
      tasks.json file creation issue. Try deleting the tasks.json file and retrying the task.`,err));
    }
    return Promise.resolve(new IotResult(StatusResult.Ok,undefined,undefined));
  }

  private MergeDictionaryWithJSON(dictionary:Map<string,string>,data:string):string{
    let result:string=data;
    dictionary.forEach((value,key) => {      
      const re = new RegExp(key, 'g');
      result=result.replace(re,value);      
    });
    return result;
  }

  public Refresh() {              
    this.Options.Build();    
    this.Environments.Build();    
  }

  public Rename(newLabel:string): boolean {    
    let result:boolean=false;
    //check launch.json
    const pathLaunchFile=<string>this.Project.WorkspaceDirectory+"\\.vscode\\launch.json";
    if (!fs.existsSync(pathLaunchFile)) return result;
    //Change in file
    const datafile= fs.readFileSync(pathLaunchFile, 'utf8');
    let jsonLaunch = JSON.parse(datafile);
    //    
    jsonLaunch.configurations.forEach((element:any) => {
      const fastiotId = element.fastiotId;
      if(this.IdConfiguration==fastiotId)
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
    const pathLaunchFile=<string>this.Project.WorkspaceDirectory+"\\.vscode\\launch.json";
    if (fs.existsSync(pathLaunchFile)){
      //delete
      const datafile= fs.readFileSync(pathLaunchFile, 'utf8');
      let jsonLaunch = JSON.parse(datafile);            
      //filter
      jsonLaunch.configurations=jsonLaunch.configurations.filter((e:any) => e.fastiotId !=this.IdConfiguration);
      //write file
      fs.writeFileSync(pathLaunchFile,JSON.stringify(jsonLaunch,null,2));      
    }    
    //deleting related tasks
    //tasks.json
    const pathTasksFile=<string>this.Project.WorkspaceDirectory+"\\.vscode\\tasks.json";
    if (fs.existsSync(pathTasksFile))    
    {
      const dataFile= fs.readFileSync(pathTasksFile, 'utf8');
      let jsonTasks = JSON.parse(dataFile);
      //filter. fastiot-67c94b5e
      const taskLabel=`fastiot-${this.IdConfiguration}`;
      jsonTasks.tasks=jsonTasks.tasks.filter((e:any) => !e.label.includes(taskLabel));      
      //write file            
      fs.writeFileSync(pathTasksFile,JSON.stringify(jsonTasks,null,2));
   }    
  }
  
  public Rebuild()
  {
    //deleting related configuration and tasks
    this.Remove();            
    //creating a configuration    
    this.CreateLaunch(<string>this.label);    
    //creating a tasks
    this.CreateTasks();
  }

  public UpdateEnviroments(): boolean {  
    let result:boolean=false;
    //check launch.json
    const pathLaunchFile=<string>this.Project.WorkspaceDirectory+"\\.vscode\\launch.json";
    if (!fs.existsSync(pathLaunchFile)) return result;
    //Change in file
    const datafile= fs.readFileSync(pathLaunchFile, 'utf8');
    let jsonLaunch = JSON.parse(datafile);
    //    
    jsonLaunch.configurations.forEach((element:any) => {
      const fastiotId = element.fastiotId;
      if(this.IdConfiguration==fastiotId)
      {
        element.env=this.Environments.ToJSON();        
        result=true;
        //write file
        fs.writeFileSync(pathLaunchFile,JSON.stringify(jsonLaunch,null,2));
      }
    });
    return result;
  }

  iconPath = {
    light: path.join(__filename, '..', '..', 'resources', 'light', 'lanch.svg'),
    dark: path.join(__filename, '..', '..', 'resources', 'dark', 'lanch.svg')
  };
}
