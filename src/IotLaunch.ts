import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {BaseTreeItem} from './BaseTreeItem';
import {IotResult,StatusResult } from './IotResult';
import {IotDevice} from './IotDevice';
import {IotLaunchEnvironment} from './IotLaunchEnvironment';
import {IotOption} from './IotOption';
import {IoTHelper} from './Helper/IoTHelper';
import {launchHelper} from './Helper/launchHelper';
import {IotConfiguration} from './Configuration/IotConfiguration';

export class IotLaunch {

  private _workspaceDirectory:string;
  public get WorkspaceDirectory(): string {
    return this._workspaceDirectory;}

  private _idLaunch:string| undefined;
  public get IdLaunch(): string| undefined {
    return this._idLaunch;}

  private _label:string| undefined;
  public get Label(): string| undefined {
    return this._label;}

  private _description:string| undefined;
  public get Description(): string| undefined {
    return this._description;}

  private _launchFilePath:string;
  public get LaunchFilePath(): string {
    return this._launchFilePath;}

  private _tasksFilePath:string;
  public get TasksFilePath(): string {
    return this._tasksFilePath;}

  private _device:IotDevice|string| undefined;
  public get Device(): IotDevice|string| undefined {
    return this._device;}

  private _pathProject:string| undefined;
  public get PathProject(): string| undefined {
    return this._pathProject;}

  private _idTemplate:string| undefined;
  public get IdTemplate(): string| undefined {
    return this._idTemplate;}

  private _options:IotOption[];
  public get Options(): IotOption[] {
    return this._options;}

  private _environments:IotLaunchEnvironment;
  public get Environments(): IotLaunchEnvironment {
    return this._environments;}

  constructor(workspaceDirectory:string){
    this._workspaceDirectory=workspaceDirectory;
    this._launchFilePath=<string>this.WorkspaceDirectory+"\\.vscode\\launch.json";
    this._tasksFilePath=<string>this.WorkspaceDirectory+"\\.vscode\\tasks.json";
    this._options = [];
    this._environments = new IotLaunchEnvironment();  
  }

  public Load(idLaunch:string,devices: Array<IotDevice>): IotResult {  
    let result:IotResult;
    try {
      result = this.GetJsonLaunch();
      if(result.Status==StatusResult.Error) return result;  
      let jsonLaunch = result.returnObject;
      const launch=jsonLaunch.configurations.find((x:any) => x.fastiotIdLaunch ==idLaunch);
      if (launch) {
        this.FromJSON(launch,devices);
      }else {
        result= new IotResult(StatusResult.Error,`Launch not found. IdLaunch: ${idLaunch}`);
      }
    } catch (err: any){
      result= new IotResult(StatusResult.Error,`Read IdLaunch: ${idLaunch}`,err);
    }
    return result;
  }

  public GetAllLaunchs(devices: Array<IotDevice>): IotResult {
    let launchs:IotLaunch[]=[];
    let result:IotResult;
    try {
      result = this.GetJsonLaunch();
      if(result.Status==StatusResult.Error) return result;
      let jsonLaunchAll = result.returnObject;
      //Recovery of every Launch    
      let index=0;
      do {
        let jsonLaunchConf=jsonLaunchAll.configurations[index];
        if(jsonLaunchConf) {
          //parse
          let launch = new IotLaunch(this._workspaceDirectory);
          result=launch.FromJSON(jsonLaunchConf,devices);
          if(result.Status==StatusResult.Ok){
            //Add
            launchs.push(launch);
          }
          //next position
          index=index+1;
        } else break;
      } 
      while(true)
      result=new IotResult(StatusResult.Ok,`All Launch successfully read ${this.LaunchFilePath}`);
      result.returnObject=launchs;
    } catch (err: any){
      result= new IotResult(StatusResult.Error,`Launch read error ${this.LaunchFilePath}`,err);
    }
    return result;
  }

  public FromJSON(jsonObj:any,devices: Array<IotDevice>):IotResult{
    let result:IotResult;
    try
    {        
      //verification - fastiotIdLaunch
      if(!jsonObj.fastiotIdLaunch)
        return new IotResult(StatusResult.No,`This Launch is not for FastIoT. jsonObj: ${jsonObj}`);
      //reading variables - fastiotIdLaunch, fastiotIdDevice, fastiotProject, fastiotIdTemplate
      //fastiotIdLaunch
      this._idLaunch=jsonObj.fastiotIdLaunch;
      //fastiotIdDevice
      //find device
      const idDevice:string=jsonObj.fastiotIdDevice;
      const device=devices.find(x=>x.IdDevice==idDevice);
      if(device)
        this._device=device;
        else this._device=idDevice;
      //fastiotProject
      this._pathProject=jsonObj.fastiotProject;
      //fastiotIdTemplate
      this._idTemplate=jsonObj.fastiotIdTemplate;
      //Environments
      if(jsonObj.env) this.Environments.FromJSON(jsonObj.env);
      //Label-name
      this._label=jsonObj.name;
      //Description
      this._description=jsonObj.fastiotDescription;
      //
      result=new IotResult(StatusResult.Ok,`Launch successfully loaded ${this._idLaunch}`);
    }
    catch (err:any)
    {
      result=new IotResult(StatusResult.Error,`Launch FromJSON. jsonObj: ${jsonObj}`,err);
    }
    return result;
  }

  public GetOptions(): IotOption[] {
    let options:IotOption[]=[];
    try {
      let option:IotOption;
      //IdLaunch
      option=new IotOption("ID Launch",this.IdLaunch);
      options.push(option);
      //Project
      if(this.PathProject) {
        const fullPathProject= IoTHelper.ReverseSeparatorLinuxToWin(this.WorkspaceDirectory+this.PathProject);
        option=new IotOption("Project",this.PathProject);
        if(fs.existsSync(fullPathProject)) {
          //OK
          option.Tooltip=fullPathProject;
        } else{
          //not found
          option.Status=StatusResult.Error;
          option.Tooltip=`Not found: ${fullPathProject}`;
        }
        options.push(option);
      } else{
        option=new IotOption("Project","not found","Project not found",StatusResult.Error);
        options.push(option);
      }
      //IdTemplate
      if(this.IdTemplate) {
        option=new IotOption("Template",this.IdTemplate);
        options.push(option);
      } else{
        option=new IotOption("Template","not found","Template not found",StatusResult.Error);
        options.push(option);
      }
      //IdDevice - IotDevice|string| undefined
      if(this.Device) {
        //IotDevice or string
        if(typeof this.Device === "string") {
          //string - device not found
          option=new IotOption("Device",this.Device,`${this.Device} not found`,StatusResult.Error);
          options.push(option);
        } else{
          //IotDevice
          const description=`${this.Device?.label} ${this.Device?.Information.Architecture}`;
          const tooltip=`label: ${this.Device?.label}. Id device: ${this.Device?.IdDevice}`;
          option=new IotOption("Device",description,tooltip);
          options.push(option);
          //Username
          option=new IotOption("Username",this.Device?.Account.UserName);
          options.push(option);
        }
      } else {
        option=new IotOption("Device","not found","Device not found",StatusResult.Error);
        options.push(option);
      }
    } catch (err: any){
      console.log(err);
    }
    return options;
  }

  public Rename(newLabel:string): IotResult {
    let result:IotResult;
    try {
      //Change in file
      result = this.GetJsonLaunch();
      if(result.Status==StatusResult.Error) return result;
      let jsonLaunch = result.returnObject;
      result= new IotResult(StatusResult.Error,`Launch not found. IdLaunch: ${this.IdLaunch}`);
      //change
      const launch=jsonLaunch.configurations.find((x:any) => x.fastiotIdLaunch ==this.IdLaunch);
      if(launch) {
        launch.name=newLabel;
        //write file
        result=this.SaveLaunch(jsonLaunch);
      }
    } catch (err: any){
      result= new IotResult(StatusResult.Error,`Rename launch. IdLaunch: ${this.IdLaunch}`,err);
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
        result= new IotResult(StatusResult.Error,`Launch not found. IdLaunch: ${this.IdLaunch}`);
      }else{
        //Task
        const preLaunchTask=launch.preLaunchTask;
        if(preLaunchTask){
          //delete a task chain
          result= this.DeleteTaskChaine(this._idLaunch ?? "non",jsonLaunch,jsonTasks);
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

  private get existsLaunchTasks(): boolean {
    return (fs.existsSync(this.LaunchFilePath)&&fs.existsSync(this.TasksFilePath));}

  private GetJsonLaunch():IotResult{
    const result=this.GetJsonFile(this.LaunchFilePath);
    return result;
  }

  private GetJsonTasks():IotResult{
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
        result= new IotResult(StatusResult.Ok,`GetJsonFile ${filePath}`);
        result.returnObject=json;
        return result;
      }else {
        result= new IotResult(StatusResult.Error,`Files launch.json and tasks.json not found in folder /.vscode. Project is a ${this.PathProject}`);
        result.tag="404";
      }
    } catch (err: any){
      result= new IotResult(StatusResult.Error,`GetJsonFile ${filePath}`,err);
    }
    return result;
  }

  private SaveLaunch(json:any):IotResult{
    return this.SaveFile(this.LaunchFilePath,json);
  }

  private SaveTasks(json:any):IotResult{
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
        result= new IotResult(StatusResult.Ok,`No tasks to delete. IdLaunch: ${this.IdLaunch}`);
        result.returnObject=jsonTasks;
        return result;
      }
      taskChains.delete(fastiotIdLaunch);
      let tasks:string[]=[];
      //get all tasks
      taskChains.forEach((values,key) => {      
        values.forEach((value) => tasks.push(value));
      });
      //получаем разность массивов
      //для исключения зависимых задач от других Launch
      //tasksChainDelete - массив с задачами для удаления
      //tasks - массив используемых задач другими Launch
      const differenceTasks = tasksChainDelete.filter(x => !tasks.includes(x));
      if(differenceTasks.length==0)
      {
        //no tasks to delete
        result= new IotResult(StatusResult.Ok,`No tasks to delete. IdLaunch: ${this.IdLaunch}`);
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
      result= new IotResult(StatusResult.Ok,`Task chain successfully deleted for IdLaunch: ${fastiotIdLaunch}`);
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
      result=new IotResult(StatusResult.Ok,`Task chains successfully built. IdLaunch: ${this.IdLaunch}`);
      result.returnObject=taskChains;
    } catch (err: any){
      result= new IotResult(StatusResult.Error,`Error building task chains. IdLaunch: ${this.IdLaunch}`,err);
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
        result=new IotResult(StatusResult.Ok,`Task chain for preLaunchTask: ${preLaunchTask} successfully built`);
      }else{
        result=new IotResult(StatusResult.No,`No task chains for preLaunchTask: ${preLaunchTask} successfully built`);
      }
      result.returnObject=taskChain;
    } catch (err: any){
      result= new IotResult(StatusResult.Error,`Error building task chains. IdLaunch: ${this.IdLaunch}, preLaunchTask: ${preLaunchTask}`,err);
    }
    return result;
  }

  public WriteEnvironments(): IotResult {  
    let result:IotResult;
    try {
      result = this.GetJsonLaunch();
      if(result.Status==StatusResult.Error) return result;  
      let jsonLaunch = result.returnObject;
      const launch=jsonLaunch.configurations.find((x:any) => x.fastiotIdLaunch ==this.IdLaunch);
      if (launch) {
        launch.env= this.Environments.ToJSON();
        //write file
        result=this.SaveLaunch(jsonLaunch);
      }
    } catch (err: any){
      result= new IotResult(StatusResult.Error,`Write Environment IdLaunch: ${this.IdLaunch}`,err);
    }
    return result;
  }

  public RebuildLaunch(config:IotConfiguration, devices: Array<IotDevice>): IotResult {
    let result:IotResult;
    //--------------Checks--------------
    //check device
    if(!this.Device) {
      result= new IotResult(StatusResult.Error,`Missing device for idLaunch: ${this.IdLaunch}`);
      return result;
    }
    if(typeof this.Device === "string") {
      result= new IotResult(StatusResult.Error,`Missing device for idLaunch: ${this.IdLaunch}`);
      return result;
    }
    //check project
    const projectMainfilePath=IoTHelper.ReverseSeparatorLinuxToWin(`${this._workspaceDirectory}${this.PathProject}`);
    if (!fs.existsSync(projectMainfilePath)) {
      result= new IotResult(StatusResult.Error,`Missing project: ${projectMainfilePath}`);
      return result;
    }
    //check template
    const template = config.Templates.FindbyId(this.IdTemplate ?? "non");
    if (!template) {
      result= new IotResult(StatusResult.Error,`Missing template: ${this.IdTemplate}`);
      return result;
    }
    //--------------Main--------------
    //get json linked Launchs
    result=this.GetJsonLaunch();
    if(result.Status==StatusResult.Error) return result;
    let jsonLaunch=<any>result.returnObject;
    let jsonLinkedLaunchs=jsonLaunch.configurations.filter((e:any) => e.fastiotIdLaunch);
    jsonLinkedLaunchs=jsonLinkedLaunchs.filter((e:any) => e.fastiotIdLaunch.includes(this.IdLaunch?.substring(0,8)));
    //create a Message and get IotLaunch LinkedLaunchs
    let LinkedLaunchs:Array<IotLaunch>=[];
    let msg="\n";
    let index=1;
    jsonLinkedLaunchs.forEach((item:any) => {
      let launchItem = new IotLaunch(this._workspaceDirectory);
      result=launchItem.FromJSON(item,devices);
      if(result.Status==StatusResult.Error) return Promise.resolve(result);
      LinkedLaunchs.push(launchItem);
      //
      msg= msg + `${index}) ${launchItem.IdLaunch} ${launchItem.Label?.toString()}\n`;
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
    result = template.AddConfigurationVscode(this.Device,config,this._workspaceDirectory,values);
    if(result.Status==StatusResult.Error) return result;
    const newLaunchId=result.tag;
    //--------------End of process--------------
    //Name and env recovery
    result = this.GetJsonLaunch();
    if(result.Status==StatusResult.Error) return result;
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
    result=this.SaveLaunch(jsonNewLaunch);
    if(result.Status==StatusResult.Error) return result;
    return result;
  }









}
