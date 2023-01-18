import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import {v4 as uuidv4} from 'uuid';

import {EntityType} from '../Entity/EntityType';
import {EntityBase} from '../Entity/EntityBase';
import {EntityBaseAttribute} from '../Entity/EntityBaseAttribute';
import {IotTemplateAttribute} from './IotTemplateAttribute';
import { IotResult,StatusResult } from '../IotResult';
import {MakeDirSync,ReverseSeparatorReplacement,ReverseSeparatorWinToLinux } from '../Helper/IoTHelper';
import {GetDotNetRID} from '../Helper/dotnetHelper';
import { IotDevice } from '../IotDevice';
import { IotConfiguration } from '../Configuration/IotConfiguration';

export class IotTemplate extends EntityBase<IotTemplateAttribute> {
  public get AppsPath(): string {
    return this.ParentDir+"\\apps";}
  public get TemplatePath(): string {
    return this.ParentDir+"\\template";}
  public get ImagePath(): string {
    return this.ParentDir+"\\template.fastiot.png";}

  private MergeDictionary:Map<string,string>= new Map<string,string>();

  constructor(
    ){
      super("Template",new IotTemplateAttribute());
  }

  public Init(type:EntityType,filePath:string,recoverySourcePath:string|undefined)
  {
    super.Init(type,filePath,recoverySourcePath);
    if(!this.IsValid) return;
    //next
    this.Validation();
    //if(this.IsValid) this.Parse(filePath);
  }

  protected Validation(){
    this._validationErrors=[];
    //проверка структуры папок
    if (!fs.existsSync(this.AppsPath)) 
      this._validationErrors.push(`${this.AppsPath} folder does not exist`);
    if (!fs.existsSync(this.TemplatePath)) 
      this._validationErrors.push(`${this.TemplatePath} folder does not exist`);
    if (!fs.existsSync(this.ImagePath)) 
      this._validationErrors.push(`${this.ImagePath} file does not exist`);
    // TODO: проверка наличия файлов ???
    /*
    extensions.json
    insert_launch.json
    insert_tasks.json
    launch.json
    tasks.json

    dotnetapp.csproj
    */
  }

  //------------ Project ------------
  public CreateProject(device:IotDevice, config:IotConfiguration, dstPath:string,
    nameProject:string,objJSON:any):IotResult {
    let result:IotResult;
    try {
      //Copy
      result=this.Copy(dstPath);
      if(result.Status==StatusResult.Error) return result;
      //rename mainFileProj: dotnetapp.csproj
      let projectMainfilePath="";
      const oldPath=dstPath+"\\"+this.Attributes.MainFileProj;
      const re = /(?:\.([^.]+))?$/;
      const ext = re.exec(this.Attributes.MainFileProj);
      if(ext?.length==2)
        {
          const extFile = ext[1];
          const newPath=dstPath+"\\"+nameProject+"."+extFile;
          fs.renameSync(oldPath,newPath)
          projectMainfilePath=newPath;
        }
      //Create MergeDictionary
      this.CreatingMergeDictionary(device,config,dstPath,nameProject,projectMainfilePath,objJSON);
      //Insert Launch
      result=this.InsertLaunch(device,dstPath,nameProject);

      //Insert Tasks

      //FilesToProcess

      //File Name Replacement

    } catch (err: any){
      //result
      result = new IotResult(StatusResult.Error,"An error occurred while creating the project",err);
    }
    return result;
  }

  private InsertLaunch(device:IotDevice, dstPath:string,nameProject:string):IotResult {
    let result:IotResult;
    try {
      //Insert lanch



      //result
      result = new IotResult(StatusResult.Ok,undefined,undefined);
    } catch (err: any){
      //result
      result = new IotResult(StatusResult.Error,"Unable to create Launch for /.vscode",err);
    }
    return result;
  }

  private Copy(dstPath:string):IotResult {
    let result:IotResult;
    try {
      //Create dir
      MakeDirSync(dstPath);
      fs.copySync(this.ParentDir+"\\template", dstPath);
      // remove files
      let file=dstPath+"\\.vscode\\insert_launch.json";
      if (fs.existsSync(file)) fs.removeSync(file);
      file=dstPath+"\\.vscode\\insert_tasks.json";
      if (fs.existsSync(file)) fs.removeSync(file);
      //
      result = new IotResult(StatusResult.Ok,undefined,undefined);
    } catch (err: any){
      //result
      result = new IotResult(StatusResult.Error,`Error copying template to ${dstPath} folder`,err);
    }
    return result;
  }

  private GetPathAsCygdrive(dirPath:string):string
  {
    //folderPath    
    const folderPath=path.dirname(dirPath);
    //Rsync
    let objArray=(<string>folderPath).split("\\"); 
    objArray[0]=objArray[0].replace(":","");
    let cyPath="/cygdrive";
    objArray.forEach(element =>{
      cyPath=cyPath+`/${element}`;
    });
    return cyPath;
  }

  private CreateGuid():string
  {
    const guid = uuidv4();
    return guid.substr(0,8);
  }

  private MergeWithDictionary(dictionary:Map<string,string>,data:string):string{
    let result:string=data;
    dictionary.forEach((value,key) => {      
      const re = new RegExp(key, 'g');
      result=result.replace(re,value);      
    });
    return result;
  }

  private CreatingMergeDictionary (device:IotDevice, config:IotConfiguration,dstPath:string,nameProject:string,
    projectMainfilePath:string,objJSON:any) {        
    this.MergeDictionary.clear();
    //project
    this.MergeDictionary.set("%{project.name}",<string>nameProject);
    this.MergeDictionary.set("%{project.mainfile.path.aswindows}",projectMainfilePath);
    let path_project_win_to_linux=ReverseSeparatorWinToLinux(projectMainfilePath);
    this.MergeDictionary.set("%{project.mainfile.path.aslinux}",path_project_win_to_linux);
    this.MergeDictionary.set("%{project.path.full.ascygdrive}",<string>this.GetPathAsCygdrive(dstPath));
    /*
    %RELATIVE_FOLDER_PATH% => %{project.path.aslinux}
    let relativeFolderPath="";
    if(this.ConfigurationLaunch.Project.RelativeFolderPath!=".")
    {
      relativeFolderPath= "\\"+<string>this.ConfigurationLaunch.Project.RelativeFolderPath;
      relativeFolderPath=ReverseSeparatorWinToLinux(relativeFolderPath);
    }    
    this.MergeDictionary.set("%RELATIVE_FOLDER_PATH%",relativeFolderPath);
    */
    //device
    this.MergeDictionary.set("%{device.id}",<string>device.IdDevice); 
    let ssh_key= config.Folder.DeviceKeys+"\\"+<string>device?.Account.Identity;
    ssh_key=ReverseSeparatorReplacement(ssh_key);
    this.MergeDictionary.set("%{device.ssh.key.fullpath}",ssh_key);
    this.MergeDictionary.set("%{device.ssh.port}",<string>device?.Account.Port);
    this.MergeDictionary.set("%{device.user.debug}",<string>device?.Account.UserName);
    this.MergeDictionary.set("%{device.host}",<string>device?.Account.Host);
    this.MergeDictionary.set("%{device.label}",<string>device?.label);
    this.MergeDictionary.set("%{device.board.name}",<string>device?.Information.BoardName);
    //fastiot
    this.MergeDictionary.set("%{launch.id}",this.CreateGuid());
    //dotnet
    //RID Catalog
    const rid=GetDotNetRID(<string>device?.Information.OsName,<string>device?.Information.Architecture);
    this.MergeDictionary.set("%{device.dotnet.rid}",<string>rid);
    //target
    if(objJSON.dotnetTarget) this.MergeDictionary.set("%{project.dotnet.targetframework}",<string>objJSON.dotnetTarget);
    //template app folder
    const appsPath=ReverseSeparatorReplacement(this.AppsPath);
    this.MergeDictionary.set("%{fastiot.settings.apps.path.aswindows}",<string>appsPath);
    //launch. Always last
    const label=this.MergeWithDictionary(this.MergeDictionary,config.TemplateTitleLaunch);
    this.MergeDictionary.set("%{launch.label}",<string>label); 
  }

}
