import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import {v4 as uuidv4} from 'uuid';

import {EntityType} from '../Entity/EntityType';
import {EntityBase} from '../Entity/EntityBase';
import {EntityBaseAttribute} from '../Entity/EntityBaseAttribute';
import {IotTemplateAttribute} from './IotTemplateAttribute';
import {IotResult,StatusResult } from '../IotResult';
import {IoTHelper} from '../Helper/IoTHelper';
import {dotnetHelper} from '../Helper/dotnetHelper';
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
    values:Map<string,string>):IotResult {
    let result:IotResult;
    try {
      //Copy
      result=this.Copy(dstPath);
      if(result.Status==StatusResult.Error) return result;
      //Create MergeDictionary
      this.CreatingMergeDictionary(device,config,dstPath,values);
      //PostCreatingMergeDictionary
      this.PostCreatingMergeDictionary(device,config,dstPath,values);
      //FilesToProcess
      result=this.FilesToProcess(dstPath);
      if(result.Status==StatusResult.Error) return result;
      //File Name Replacement
      result=this.FileNameReplacement(dstPath);
      if(result.Status==StatusResult.Error) return result;
      //Insert Launch
      result=this.InsertLaunchOrTask(dstPath,"launch");
      if(result.Status==StatusResult.Error) return result;
      //Insert Tasks
      result=this.InsertLaunchOrTask(dstPath,"tasks");
      if(result.Status==StatusResult.Error) return result;
      //Open Workspace
      let folderPathParsed = "/"+dstPath.split(`\\`).join(`/`);
      let folderUri = vscode.Uri.parse(folderPathParsed);
      vscode.commands.executeCommand(`vscode.openFolder`, folderUri);
    } catch (err: any){
      //result
      result = new IotResult(StatusResult.Error,"An error occurred while creating the project",err);
    }
    return result;
  }

  public AddConfigurationVscode(device:IotDevice, config:IotConfiguration, dstPath:string,
    values:Map<string,string>):IotResult {
    let result:IotResult;
    try {
      //Copy
      result=this.CopyOnlyFilesVscode(dstPath+"\\.vscode");
      if(result.Status==StatusResult.Error) return result;
      //Create MergeDictionary
      this.CreatingMergeDictionary(device,config,dstPath,values);
      //PostCreatingMergeDictionary
      this.PostCreatingMergeDictionary(device,config,dstPath,values);
      //Insert Launch
      result=this.InsertLaunchOrTask(dstPath,"launch");
      if(result.Status==StatusResult.Error) return result;
      //Insert Tasks
      result=this.InsertLaunchOrTask(dstPath,"tasks");
      if(result.Status==StatusResult.Error) return result;
    } catch (err: any){
      //result
      result = new IotResult(StatusResult.Error,`Error when adding Launch to ${dstPath} project`,err);
    }
    return result;
  }
  //---------------------------------

  private FilesToProcess(dstPath:string):IotResult {
    let result:IotResult;
    try {
      //Files
      this.Attributes.FilesToProcess.forEach((name) => {
        const filePath=dstPath+"\\"+name;
        let text =fs.readFileSync(filePath, 'utf-8');
        text=this.MergeWithDictionary(this.MergeDictionary,text);
        //write file
        fs.writeFileSync(filePath, text,undefined);
      });
      //result
      result = new IotResult(StatusResult.Ok,undefined,undefined);
    } catch (err: any){
      //result
      result = new IotResult(StatusResult.Error,"Unable to merge for filesToProcess",err);
    }
    return result;
  }

  private FileNameReplacement(dstPath:string):IotResult {
    let result:IotResult;
    try {
      //Files
      this.Attributes.FileNameReplacement.forEach((value,key) => {
        const oldPath=dstPath+"\\"+key;
        value=this.MergeWithDictionary(this.MergeDictionary,value);
        const newPath=dstPath+"\\"+value;
        fs.renameSync(oldPath,newPath);
        //tracking the renaming of the main project file
        if(this.Attributes.ExtMainFileProj)
        {
          const startPos=newPath.length-this.Attributes.ExtMainFileProj.length;
          if(startPos>0)
          {
            if(newPath.substring(startPos)==this.Attributes.ExtMainFileProj){
              const projectMainfilePath=newPath;
              //full
              this.MergeDictionary.set("%{project.mainfile.path.full.aswindows}",projectMainfilePath);
              let path_project_win_to_linux=IoTHelper.ReverseSeparatorWinToLinux(projectMainfilePath);
              this.MergeDictionary.set("%{project.mainfile.path.full.aslinux}",path_project_win_to_linux);
              //
              const mainfileRelativeWinPath=projectMainfilePath.substring(dstPath.length+1);
              const mainfileRelativeLinuxPath=IoTHelper.ReverseSeparatorWinToLinux(mainfileRelativeWinPath);
              this.MergeDictionary.set("%{project.mainfile.path.relative.aswindows}",<string>mainfileRelativeWinPath);
              this.MergeDictionary.set("%{project.mainfile.path.relative.aslinux}",<string>mainfileRelativeLinuxPath);
            }
          }
        }
      });
      //result
      result = new IotResult(StatusResult.Ok,undefined,undefined);
    } catch (err: any){
      //result
      result = new IotResult(StatusResult.Error,"Unable to merge for filesToProcess",err);
    }
    return result;
  }

  private InsertLaunchOrTask(dstPath:string,entity:string /*launch or tasks*/):IotResult {
    let result:IotResult;
    try {
      //debug
      const debugFilePath=`${dstPath}\\debug_${entity}_json.txt`;
      //open files
      const fileEntityPath=`${dstPath}\\.vscode\\${entity}.json`;
      let dataEntity:string= fs.readFileSync(fileEntityPath,'utf8');
      dataEntity=IoTHelper.DeleteComments(dataEntity);
      const fileInsertEntityPath=`${this.TemplatePath}\\.vscode\\insert_${entity}_key.json`;
      let insertDataEntitys:string= fs.readFileSync(fileInsertEntityPath,'utf8');
      insertDataEntitys=IoTHelper.DeleteComments(insertDataEntitys);
      //toJSON
      fs.writeFileSync(debugFilePath, dataEntity,undefined);
      let jsonDataEntity = JSON.parse(dataEntity);
      fs.writeFileSync(debugFilePath, insertDataEntitys,undefined);
      const jsonInsertDataEntitys = JSON.parse(insertDataEntitys);
      //insert entitys
      let index=0;    
      do {
        const jsonInsertDataEntity=jsonInsertDataEntitys.values[index];
        if(jsonInsertDataEntity)
        {
          if(entity=="launch") jsonDataEntity.configurations.push(<never>jsonInsertDataEntity);
          if(entity=="tasks") jsonDataEntity.tasks.push(<never>jsonInsertDataEntity);
          //next position
          index=index+1;
        }else break;      
      } 
      while(true)
      //toTXT
      let data=JSON.stringify(jsonDataEntity,null,2);
      //Merge
      data=this.MergeWithDictionary(this.MergeDictionary,data);
      //save in file
      fs.writeFileSync(fileEntityPath, data,undefined);
      //result
      fs.removeSync(debugFilePath);
      result = new IotResult(StatusResult.Ok,undefined,undefined);
    } catch (err: any){
      //result
      result = new IotResult(StatusResult.Error,`Unable to create ${entity} for /.vscode. File ${entity}.json or insert_${entity}_*.json. See file debug_${entity}_json.txt`,err);
    }
    return result;
  }

  private Copy(dstPath:string):IotResult {
    let result:IotResult;
    try {
      //Create dir
      IoTHelper.MakeDirSync(dstPath);
      fs.copySync(this.TemplatePath, dstPath);
      // remove files
      let file=dstPath+"\\.vscode\\insert_launch_key.json";
      if (fs.existsSync(file)) fs.removeSync(file);
      file=dstPath+"\\.vscode\\insert_tasks_key.json";
      if (fs.existsSync(file)) fs.removeSync(file);
      //copy template.fastiot.yaml
      fs.copyFileSync(this.DescriptionFilePath,dstPath+"\\template.fastiot.yaml");
      result = new IotResult(StatusResult.Ok,undefined,undefined);
    } catch (err: any){
      //result
      result = new IotResult(StatusResult.Error,`Error copying template to ${dstPath} folder`,err);
    }
    return result;
  }

  private CopyOnlyFilesVscode(dstPath:string):IotResult {
    let result:IotResult;
    try {
      //Create dir
      IoTHelper.MakeDirSync(dstPath);
      //copy files from /.vscode to dstPath(project)
      const files = fs.readdirSync(this.TemplatePath+"\\.vscode");
      files.forEach(name => {
        //Exception check
        if (name=="insert_launch_key.json"||name=="insert_tasks_key.json")
        {/* skip */}else{
          //file
          const file=`${this.TemplatePath}\\.vscode\\${name}`;
          if(fs.lstatSync(file).isFile())
          {
            const dstFile=`${dstPath}\\${name}`;
            //check
            if(!fs.existsSync(dstFile)){
              //copy file
              fs.copyFileSync(file,dstFile);
            } 
          }
        }
      });
      result = new IotResult(StatusResult.Ok,undefined,undefined);
    } catch (err: any){
      //result
      result = new IotResult(StatusResult.Error,`Error copying .vscode files from ${this.TemplatePath}\.vscode to ${dstPath} folder`,err);
    }
    return result;
  }

  private GetPathAsCygdrive(dirPath:string):string
  {
    //first lowcase
    dirPath=dirPath.substring(0,1).toLowerCase()+dirPath.substring(1);
    //folderPath    
    //const folderPath=path.dirname(dirPath);
    //Rsync
    let objArray=(<string>dirPath).split("\\"); 
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

  private CreatingMergeDictionary (device:IotDevice, config:IotConfiguration,
    dstPath:string, values:Map<string,string>) {
    this.MergeDictionary.clear();
    //project
    this.MergeDictionary.set("%{project.name}",<string>values.get("%{project.name}"));
    //NEW or ADD
    let projMainfilePathFullWin=values.get("%{project.mainfile.path.full.aswindows}");
    let projMainfilePathFullLinux=values.get("%{project.mainfile.path.full.aslinux}");
    if((projMainfilePathFullWin)/*||(projMainfilePathFullLinux)*/)
        {
          //in <= project.mainfile.path.full.aswindows
          //--------------------ADD--------------------
          this.MergeDictionary.set("%{project.mainfile.path.full.aswindows}",projMainfilePathFullWin);
          projMainfilePathFullLinux=IoTHelper.ReverseSeparatorWinToLinux(projMainfilePathFullWin);
          this.MergeDictionary.set("%{project.mainfile.path.full.aslinux}",projMainfilePathFullLinux);
          //next
          const dir = path.dirname(projMainfilePathFullWin);
          const projectPathRelativeWin= dir.substring(dstPath.length);
          this.MergeDictionary.set("%{project.path.relative.aswindows}",projectPathRelativeWin);
          const projectPathRelativeLinux=IoTHelper.ReverseSeparatorWinToLinux(projectPathRelativeWin);
          this.MergeDictionary.set("%{project.path.relative.aslinux}",<string>projectPathRelativeLinux);
          const mainFilePathRelativeWin=projMainfilePathFullWin.substring(dstPath.length);
          this.MergeDictionary.set("%{project.mainfile.path.relative.aswindows}",<string>mainFilePathRelativeWin);
          const mainFilePathRelativeLinux=IoTHelper.ReverseSeparatorWinToLinux(mainFilePathRelativeWin);
          this.MergeDictionary.set("%{project.mainfile.path.relative.aslinux}",<string>mainFilePathRelativeLinux);
          //------------------END_ADD------------------
        }else{
          //--------------------NEW--------------------
          //project.path.relative
          let lastIndex=this.Attributes.MainFileProj.lastIndexOf('\\');
          if(lastIndex<0) lastIndex=this.Attributes.MainFileProj.lastIndexOf('/');
          let relativePath:string="";
          if(lastIndex>0)
          {
            relativePath=this.Attributes.MainFileProj.substring(0);
            lastIndex=this.Attributes.MainFileProj.lastIndexOf('/');
            if(lastIndex<0)
            {
              relativePath=this.Attributes.MainFileProj.substring(0,this.Attributes.MainFileProj.length-lastIndex);
            }
          }
          this.MergeDictionary.set("%{project.path.relative.aswindows}",<string>relativePath);
          relativePath=IoTHelper.ReverseSeparatorWinToLinux(relativePath);
          this.MergeDictionary.set("%{project.path.relative.aslinux}",<string>relativePath);
          //
          const projectMainfilePath=dstPath+"\\"+this.Attributes.MainFileProj;
          this.MergeDictionary.set("%{project.mainfile.path.full.aswindows}",projectMainfilePath);
          let path_project_win_to_linux=IoTHelper.ReverseSeparatorWinToLinux(projectMainfilePath);
          this.MergeDictionary.set("%{project.mainfile.path.full.aslinux}",path_project_win_to_linux);
          //
          const mainfileRelativeWinPath=relativePath+this.Attributes.MainFileProj;
          const mainfileRelativeLinuxPath=IoTHelper.ReverseSeparatorWinToLinux(mainfileRelativeWinPath);
          this.MergeDictionary.set("%{project.mainfile.path.relative.aswindows}",<string>mainfileRelativeWinPath);
          this.MergeDictionary.set("%{project.mainfile.path.relative.aslinux}",<string>mainfileRelativeLinuxPath);
          //------------------END_NEW------------------
        }
        this.MergeDictionary.set("%{project.path.full.ascygdrive}",<string>this.GetPathAsCygdrive(dstPath));
    //
    this.MergeDictionary.set("%{project.type}",<string>this.Attributes.TypeProj);
    //device
    this.MergeDictionary.set("%{device.id}",<string>device.IdDevice); 
    let ssh_key= config.Folder.DeviceKeys+"\\"+<string>device?.Account.Identity;
    ssh_key=IoTHelper.ReverseSeparatorReplacement(ssh_key);
    this.MergeDictionary.set("%{device.ssh.key.path.full.aswindows}",ssh_key);
    this.MergeDictionary.set("%{device.ssh.port}",<string>device?.Account.Port);
    this.MergeDictionary.set("%{device.user.debug}",<string>device?.Account.UserName);
    this.MergeDictionary.set("%{device.host}",<string>device?.Account.Host);
    this.MergeDictionary.set("%{device.label}",<string>device?.label);
    this.MergeDictionary.set("%{device.board.name}",<string>device?.Information.BoardName);
    //fastiot
    this.MergeDictionary.set("%{launch.id}",this.CreateGuid());
    this.MergeDictionary.set("%{launch.group.id}",this.CreateGuid());
    //template app folder
    const appsPath=IoTHelper.ReverseSeparatorReplacement(this.AppsPath);
    this.MergeDictionary.set("%{fastiot.settings.apps.path.aswindows}",<string>appsPath);
  }

  private PostCreatingMergeDictionary(device:IotDevice, config:IotConfiguration,
    dstPath:string, values:Map<string,string>){
    //dotnet
    if(this.Attributes.TypeProj=="dotnet"){
      //namespace
      const projectName=values.get("%{project.name}");
      if(projectName)
        this.MergeDictionary.set("%{project.dotnet.namespace}",<string>dotnetHelper.GetDotNetValidNamespace(projectName));
      //RID Catalog
      const rid=dotnetHelper.GetDotNetRID(<string>device?.Information.OsName,<string>device?.Information.Architecture);
      this.MergeDictionary.set("%{device.dotnet.rid}",<string>rid);
      //target
      let targetFramework=values.get("%{project.dotnet.targetframework}");
      if(!targetFramework){
        //Read from dstPath
        const filePath= this.MergeDictionary.get("%{project.mainfile.path.full.aswindows}");
        if (filePath) targetFramework=dotnetHelper.GetTargetFrameworkFromCsprojFile(filePath);
      }
      if(targetFramework) 
        this.MergeDictionary.set("%{project.dotnet.targetframework}",<string>targetFramework);
    }
    //launch. Always last
    const label=this.MergeWithDictionary(this.MergeDictionary,config.TemplateTitleLaunch);
    this.MergeDictionary.set("%{launch.label}",<string>label); 
  }

  public FindProjects(dir:string): Array<string>{    
    //search for projects in depth on three levels
    const projects = IoTHelper.GetAllFilesByExt(dir,this.Attributes.ExtMainFileProj);    
    return projects;
  }

}
