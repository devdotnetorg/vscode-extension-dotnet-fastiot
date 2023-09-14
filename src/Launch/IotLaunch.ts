import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { ISbc } from '../Sbc/ISbc';
import { IotLaunchEnvironment } from './IotLaunchEnvironment';
import { TreeItem } from '../shared/TreeItem';
import { IoTHelper } from '../Helper/IoTHelper';
import { IConfiguration } from '../Configuration/IConfiguration';
import { IotLaunchOption } from './IotLaunchOption';
import { IotTemplateCollection } from '../Template/IotTemplateCollection';

export class IotLaunch {

  private readonly _workspaceDirectory:string;
  public get WorkspaceDirectory(): string {
    return this._workspaceDirectory;}

  private _idLaunch?:string;
  public get IdLaunch(): string| undefined {
    return this._idLaunch;}

  private _label?:string;
  public get Label(): string| undefined {
    return this._label;}

  private _description?:string;
  public get Description(): string| undefined {
    return this._description;}

  private _launchFilePath:string;
  public get LaunchFilePath(): string {
    return this._launchFilePath;}

  private _tasksFilePath:string;
  public get TasksFilePath(): string {
    return this._tasksFilePath;}

  private _sbc?:ISbc|string;
  public get Sbc(): ISbc|string| undefined {
    return this._sbc;}

  private _pathProject?:string;
  public get PathProject(): string| undefined {
    return this._pathProject;}

  private _idTemplate?:string;
  public get IdTemplate(): string| undefined {
    return this._idTemplate;}

  private _environment:IotLaunchEnvironment;
  public get Environment(): IotLaunchEnvironment {
    return this._environment;}

  constructor(workspaceDirectory:string){
    this._workspaceDirectory=workspaceDirectory;
    this._launchFilePath=path.join(this.WorkspaceDirectory, ".vscode", "launch.json");
    this._tasksFilePath=path.join(this.WorkspaceDirectory, ".vscode", "tasks.json");
    this._environment = new IotLaunchEnvironment();  
  }

  public Load(idLaunch:string,sbcs: Array<ISbc>): IotResult {  
    let result:IotResult;
    const errorMsg=`Unable to load Launch IdLaunch: ${idLaunch}`;
    try {
      result = this.GetJsonLaunch();
      if(result.Status!=StatusResult.Ok)
      {
        result.AddMessage(errorMsg);
        return result;
      } 
      let jsonLaunch = result.returnObject;
      const launch=jsonLaunch.configurations.find((x:any) => x.fastiotIdLaunch ==idLaunch);
      if (launch) {
        result=this.FromJSON(launch,sbcs);
        if(result.Status==StatusResult.Error) {
          result.AddMessage(errorMsg);
          return result;
        }
      }else {
        result= new IotResult(StatusResult.Error,`Launch not found. IdLaunch: ${idLaunch}`);
      }
    } catch (err: any){
      result= new IotResult(StatusResult.Error,errorMsg,err);
    }
    result= new IotResult(StatusResult.Ok,`Launch successfully loaded. IdLaunch: ${idLaunch}`);
    return result;
  }

  public GetAllLaunchs(sbcs: Array<ISbc>): IotResult {
    let launchs:IotLaunch[]=[];
    let result:IotResult;
    try {
      result = this.GetJsonLaunch();
      if(result.Status!=StatusResult.Ok) {
        return result;
      } 
      let jsonLaunchAll = result.returnObject;
      //Recovery of every Launch    
      let index=0;
      do {
        let jsonLaunchConf=jsonLaunchAll.configurations[index];
        if(jsonLaunchConf) {
          //parse
          let launch = new IotLaunch(this._workspaceDirectory);
          result=launch.FromJSON(jsonLaunchConf,sbcs);
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

  public FromJSON(jsonObj:any,sbcs: Array<ISbc>):IotResult{
    let result:IotResult;
    try {        
      //verification - fastiotIdLaunch
      if(!jsonObj.fastiotIdLaunch)
        return new IotResult(StatusResult.No,`This Launch is not for FastIoT. jsonObj: ${jsonObj}`);
      //reading variables - fastiotIdLaunch, fastiotIdSbc (fastiotIdDevice), fastiotProject, fastiotIdTemplate
      //fastiotIdLaunch
      this._idLaunch=jsonObj.fastiotIdLaunch;
      //fastiotIdSbc (fastiotIdDevice)
      //find sbc
      let idSbc:string="None";
      if(jsonObj.fastiotIdDevice) idSbc = jsonObj.fastiotIdDevice;
      if(jsonObj.fastiotIdSbc) idSbc = jsonObj.fastiotIdSbc;
      const sbc=sbcs.find(x=>x.Id==idSbc);
      if(sbc)
        this._sbc=sbc;
        else this._sbc=idSbc;
      //fastiotProject
      this._pathProject=jsonObj.fastiotProject;
      //fastiotIdTemplate
      this._idTemplate=jsonObj.fastiotIdTemplate;
      //Environments
      if(jsonObj.env) this.Environment.FromJSON(jsonObj.env);
      //Label-name
      this._label=jsonObj.name;
      //Description
      this._description=jsonObj.fastiotDescription;
      //
      result=new IotResult(StatusResult.Ok,`Launch successfully loaded ${this._idLaunch}`);
    } catch (err:any) {
      result=new IotResult(StatusResult.Error,`Launch FromJSON. jsonObj: ${jsonObj}`,err);
    }
    return result;
  }

  public GetConfigurationItems():IotResult{
    let result:IotResult;
    let items:TreeItem[]=[];
    try {
      let item:TreeItem;
      //IdLaunch
      item=new TreeItem("ID Launch",this.IdLaunch);
      items.push(item);
      //Project
      if(this.PathProject) {
        const fullPathProject= IoTHelper.ReverseSeparatorLinuxToWin(this.WorkspaceDirectory+this.PathProject);
        item=new TreeItem("Project",this.PathProject);
        if(fs.existsSync(fullPathProject)) {
          //OK
          item.Tooltip=fullPathProject;
        } else{
          //not found
          item.Status=StatusResult.Error;
          item.Tooltip=`Not found: ${fullPathProject}`;
        }
        items.push(item);
      } else{
        item=new TreeItem("Project","not found","Project not found",StatusResult.Error);
        items.push(item);
      }
      //IdTemplate
      if(this.IdTemplate) {
        item=new TreeItem("Template",this.IdTemplate);
        items.push(item);
      } else{
        item=new TreeItem("Template","not found","Template not found",StatusResult.Error);
        items.push(item);
      }
      //IdSbc - ISbc|string| undefined
      if(this.Sbc) {
        //ISbc or string
        if(typeof this.Sbc === "string") {
          //string - sbc not found
          item=new TreeItem("SBC",this.Sbc,`${this.Sbc} not found`,StatusResult.Error);
          items.push(item);
        } else{
          //ISbc
          const description=`${this.Sbc.Label} ${this.Sbc?.Architecture}`;
          const tooltip=`label: ${this.Sbc.Label}. Id sbc: ${this.Sbc.Id}`;
          item=new TreeItem("SBC",description,tooltip);
          items.push(item);
          //Username
          //option=new IotOption("Username",this.Device?.Account.UserName);
          //options.push(option);
        }
      } else {
        item=new TreeItem("SBC","not found","SBC not found",StatusResult.Error);
        items.push(item);
      }
      result= new IotResult(StatusResult.Ok, "GetOptions");
      result.returnObject=items;
    } catch (err: any){
      result= new IotResult(StatusResult.Error,"Error. GetOptions",err);
    }
    return result;
  }

  public Rename(newLabel:string): IotResult {
    let result:IotResult;
    const errorMsg=`Launch has not been renamed!. IdLaunch: ${this.IdLaunch}`;
    try {
      //Change in file
      result = this.GetJsonLaunch();
      if(result.Status!=StatusResult.Ok) {
        result.AddMessage(errorMsg);
        return result;
      } 
      let jsonLaunch = result.returnObject;
      //change
      const launch=jsonLaunch.configurations.find((x:any) => x.fastiotIdLaunch ==this.IdLaunch);
      if(launch) { 
        launch.name=newLabel;
        //write file
        result=this.SaveLaunch(jsonLaunch);
        if(result.Status==StatusResult.Ok) {
          result= new IotResult(StatusResult.Ok,'Launch rename succeeded');
        }else{
          result.AddMessage(errorMsg);
        }
      } else result= new IotResult(StatusResult.Error,`Launch not found. IdLaunch: ${this.IdLaunch}`);
    } catch (err: any){
      result= new IotResult(StatusResult.Error,errorMsg,err);
    }
    return result;
  }

  public Remove():IotResult
  {
    let result:IotResult;
    const errorMsg=`Launch is not deleted! IdLaunch: ${this.IdLaunch}`;
    try {
      //get launch.json and tasks.json
      //launch.json
      result = this.GetJsonLaunch();
      if(result.Status!=StatusResult.Ok) {
        result.AddMessage(errorMsg);
        return result;
      } 
      let jsonLaunch = result.returnObject;
      //tasks.json
      result = this.GetJsonTasks();
      if(result.Status!=StatusResult.Ok) {
        result.AddMessage(errorMsg);
        return result;
      } 
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
          result= this.DeleteTaskChaine(jsonLaunch,jsonTasks);
          if(result.Status==StatusResult.Error){
            result.AddMessage(errorMsg);
            return result;
          }
          jsonTasks=result.returnObject;
        }
        //Launch
        //filter
        jsonLaunch.configurations=jsonLaunch.configurations.filter((e:any) => e.fastiotIdLaunch !=this.IdLaunch);
        //save
        result = this.SaveLaunch(jsonLaunch);     
        if(result.Status==StatusResult.Error) {
          result.AddMessage(errorMsg);
          return result;
        } 
        result = this.SaveTasks(jsonTasks); 
        if(result.Status==StatusResult.Error) {
          result.AddMessage(errorMsg);
          return result;
        } 
      }
      result= new IotResult(StatusResult.Ok, `Launch successfully removed`);
    } catch (err: any){
      result= new IotResult(StatusResult.Error,errorMsg,err);
    }
    return result; 
  }

  public get existsLaunchTasks(): boolean {
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
        result= new IotResult(StatusResult.Ok,`JSON file successfully read. Path: ${filePath}`);
        result.returnObject=json;
        return result;
      }else {
        result= new IotResult(StatusResult.No,`File not found. Path: ${filePath}`);
      }
    } catch (err: any){
      result= new IotResult(StatusResult.Error,`JSON file read error. Path: ${filePath}`,err);
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
      //create lock file
      const fileLockPath = path.join(path.dirname(filePath), ".lockreadlaunch");
      fs.writeFileSync(fileLockPath,``);
      //write file
      fs.writeFileSync(filePath,datafile);
      //wait unlock read launch
      this.WaitUnlockReadLaunch(fileLockPath);
      //result
      result=new IotResult(StatusResult.Ok,`File saved. filePath: ${filePath}`);
    } catch (err: any){
      result= new IotResult(StatusResult.Error,`SaveFile. filePath: ${filePath}, json: ${json}`,err); 
    }
    return result; 
  }

  private async WaitUnlockReadLaunch(fileLockPath:string, time:number=500)
  {
    try {
      //wait
      await IoTHelper.Sleep(time);
      //delete file
      if (fs.existsSync(fileLockPath)) fs.removeSync(fileLockPath);
    } catch (err: any){ }
  }

  private DeleteTaskChaine(jsonLaunch:any,jsonTasks:any):IotResult
  {
    const fastiotIdLaunch:string=this.IdLaunch ?? "non";
    const errorMsg=`Error deleting task chains. IdLaunch: ${fastiotIdLaunch}`;
    let result:IotResult;
    try {
      result=this.BuildingChainsTasks(jsonLaunch,jsonTasks);
      if(result.Status==StatusResult.Error) {
        result.AddMessage(errorMsg);
        return result;
      }
      // key - fastiotIdLaunch, value - labels tasks
      let taskChains:Map<string,string[]>= new Map<string,string[]>();
      taskChains=result.returnObject;
      const tasksChainDelete=taskChains.get(fastiotIdLaunch);
      if(!tasksChainDelete){
        //no tasks to delete
        result= new IotResult(StatusResult.Ok,`No tasks to delete. IdLaunch: ${fastiotIdLaunch}`);
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
        result= new IotResult(StatusResult.Ok,`No tasks to delete. IdLaunch: ${fastiotIdLaunch}`);
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
      result= new IotResult(StatusResult.Error,`DeleteTaskChaine. IdLaunch: ${fastiotIdLaunch}`,err);
    }
    return result;
  }

  private BuildingChainsTasks(jsonLaunch:any,jsonTasks:any):IotResult
  {
    const errorMsg=`Building task chains. IdLaunch: ${this.IdLaunch}`;
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
          if(result.Status==StatusResult.Error) {
            result.AddMessage(errorMsg);
            return result;
          }
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

  public WriteValueofKey(key:string,value:any,labelKey:string=key): IotResult {
    let result:IotResult;
    const errorMsg=`Error writing key: ${key} value: ${value} for Launch. IdLaunch: ${this.IdLaunch}`;
    try {
      result = this.GetJsonLaunch();
      if(result.Status!=StatusResult.Ok) {
        result.AddMessage(errorMsg);
        return result;
      } 
      let jsonLaunch = result.returnObject;
      const launch=jsonLaunch.configurations.find((x:any) => x.fastiotIdLaunch ==this.IdLaunch);
      if (launch) {
        launch[key] = value;
        //write file
        result=this.SaveLaunch(jsonLaunch);
        if(result.Status==StatusResult.Error) {
          result.AddMessage(errorMsg);
          return result;
        } 
      } else {
        result= new IotResult(StatusResult.Error,`Launch not found. IdLaunch: ${this.IdLaunch}`);
        return result;
      }
      result= new IotResult(StatusResult.Ok,`"${labelKey}" updated successfully`);
    } catch (err: any){
      result= new IotResult(StatusResult.Error,errorMsg,err);
    }
    return result;
  }

  public ReadValueofKey(key:string,labelKey:string=key): IotResult {
    let result:IotResult;
    const errorMsg=`Error getting value for key: ${key} for Launch. IdLaunch: ${this.IdLaunch}`;
    try {
      result = this.GetJsonLaunch();
      if(result.Status!=StatusResult.Ok) {
        result.AddMessage(errorMsg);
        return result;
      } 
      let jsonLaunch = result.returnObject;
      const launch=jsonLaunch.configurations.find((x:any) => x.fastiotIdLaunch ==this.IdLaunch);
      if (launch) {
        if(launch.hasOwnProperty(key)) {
          const value:any= launch[key];
          result= new IotResult(StatusResult.Ok,`Key: "${labelKey}", Value: ${value}"`);
          result.returnObject=value;
        } else {
          result= new IotResult(StatusResult.No,`Key: "${labelKey}" is not found`);
        }
      } else {
        result= new IotResult(StatusResult.Error,`Launch not found. IdLaunch: ${this.IdLaunch}`);
        return result;
      }
    } catch (err: any){
      result= new IotResult(StatusResult.Error,errorMsg,err);
    }
    return result;
  }

  public WriteEnvironments(): IotResult {
    const result = this.WriteValueofKey('env',this.Environment.ToJSON(),`Environment`);
    return result;
    
    /*
    let result:IotResult;
    const errorMsg=`Error writing Environments for Launch. IdLaunch: ${this.IdLaunch}`;
    try {
      result = this.GetJsonLaunch();
      if(result.Status!=StatusResult.Ok) {
        result.AddMessage(errorMsg);
        return result;
      } 
      let jsonLaunch = result.returnObject;
      const launch=jsonLaunch.configurations.find((x:any) => x.fastiotIdLaunch ==this.IdLaunch);
      if (launch) {
        launch.env= this.Environment.ToJSON();
        //write file
        result=this.SaveLaunch(jsonLaunch);
        if(result.Status==StatusResult.Error) {
          result.AddMessage(errorMsg);
          return result;
        } 
      } else {
        result= new IotResult(StatusResult.Error,`Launch not found. IdLaunch: ${this.IdLaunch}`);
        return result;
      }
      result= new IotResult(StatusResult.Ok,`"Environment" updated successfully`);
    } catch (err: any){
      result= new IotResult(StatusResult.Error,`Write Environment IdLaunch: ${this.IdLaunch}`,err);
    }
    return result;
    */
  }

  public RebuildLaunch(config:IConfiguration, templates:IotTemplateCollection, sbcs: Array<ISbc>): IotResult {
    const errorMsg=`Unable to execute RebuildLaunch. IdLaunch: ${this.IdLaunch}`;
    let result:IotResult;
    //--------------Checks--------------
    //check sbc
    if(!this.Sbc) {
      result= new IotResult(StatusResult.Error,`Missing SBC for idLaunch: ${this.IdLaunch}`);
      result.AddMessage(errorMsg);
      return result;
    }
    if(typeof this.Sbc === "string") {
      result= new IotResult(StatusResult.Error,`Missing SBC for idLaunch: ${this.IdLaunch}`);
      result.AddMessage(errorMsg);
      return result;
    }
    //check project
    const projectMainfilePath=IoTHelper.ReverseSeparatorLinuxToWin(`${this._workspaceDirectory}${this.PathProject}`);
    if (!fs.existsSync(projectMainfilePath)) {
      result= new IotResult(StatusResult.Error,`Missing project: ${projectMainfilePath}`);
      result.AddMessage(errorMsg);
      return result;
    }
    //check template
    const template = templates.FindById(this.IdTemplate ?? "non");
    if (!template) {
      result= new IotResult(StatusResult.Error,`Missing template: ${this.IdTemplate}`);
      result.AddMessage(errorMsg);
      return result;
    }
    //--------------Main--------------
    //get json linked Launchs
    result=this.GetJsonLaunch();
    if(result.Status!=StatusResult.Ok) {
      result.AddMessage(errorMsg);
      return result;
    }
    let jsonLaunch=<any>result.returnObject;
    let jsonLinkedLaunchs=jsonLaunch.configurations.filter((e:any) => e.fastiotIdLaunch);
    jsonLinkedLaunchs=jsonLinkedLaunchs.filter((e:any) => e.fastiotIdLaunch.includes(this.IdLaunch?.substring(0,8)));
    //create a Message and get IotLaunch LinkedLaunchs
    let LinkedLaunchs:Array<IotLaunch>=[];
    let msg="\n";
    let index=1;
    jsonLinkedLaunchs.forEach((item:any) => {
      let launchItem = new IotLaunch(this._workspaceDirectory);
      result=launchItem.FromJSON(item,sbcs);
      if(result.Status==StatusResult.Error) {
        result.AddMessage(errorMsg);
        return result;
      }
      LinkedLaunchs.push(launchItem);
      //
      msg= msg + `${index}) ${launchItem.IdLaunch} ${launchItem.Label?.toString()}\n`;
      index++;
    });
    vscode.window.showInformationMessage(`Rebuilding Launches: ${msg}`);
    //remove linked launchs
    LinkedLaunchs.forEach((item) => {
      result=item.Remove();
      if(result.Status==StatusResult.Error) {
        result.AddMessage(errorMsg);
        return result;
      }
    });
    //Add Configuration Vscode
    let values:Map<string,string>= new Map<string,string>();
    //Preparing values
    const baseName=path.basename(projectMainfilePath);
    const projectName=baseName.substring(0,baseName.length-template.Attributes.ExtMainFileProj.length);
    values.set("%{project.mainfile.path.full.aswindows}",projectMainfilePath);
    values.set("%{project.name}",projectName);
    result = template.AddConfigurationVscode(this.Sbc,config,this._workspaceDirectory,values);
    if(result.Status==StatusResult.Error) {
      result.AddMessage(errorMsg);
      return result;
    }
    const newLaunchId=result.tag;
    //--------------End of process--------------
    //Name and env recovery
    result = this.GetJsonLaunch();
    if(result.Status!=StatusResult.Ok) {
      result.AddMessage(errorMsg);
      return result;
    }
    let jsonNewLaunch=result.returnObject;
    //launchs
    index=0; 
    do {
      let newItemLaunch=jsonNewLaunch.configurations[index];
      if(newItemLaunch) {
        if(newItemLaunch.fastiotIdLaunch&&newItemLaunch.fastiotIdLaunch.includes(newLaunchId)){
          const oldItemLaunch=jsonLinkedLaunchs.find((x:any)=>x.fastiotIdLaunch.substring(8)==newItemLaunch.fastiotIdLaunch.substring(8));
          if(oldItemLaunch) {
            //replace name
            newItemLaunch.name=oldItemLaunch.name;
            //replace env
            if(oldItemLaunch.env) {
              if(newItemLaunch.env) {
                if(JSON.stringify(oldItemLaunch.env)!="{}")
                  newItemLaunch.env=oldItemLaunch.env;
              }else newItemLaunch.push(oldItemLaunch.env);
            }
          }
        }
        index=index+1;
      }else break;      
    } 
    while(true)
    //result
    result=this.SaveLaunch(jsonNewLaunch);
    if(result.Status==StatusResult.Error) {
      result.AddMessage(errorMsg);
      return result;
    }
    result= new IotResult(StatusResult.Ok,`Configuration rebuild completed successfully`);
    return result;
  }
  
}
