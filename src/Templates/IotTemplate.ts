import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { EntityType } from '../Entity/EntityType';
import { EntityBase } from '../Entity/EntityBase';
import { IotTemplateAttribute } from './IotTemplateAttribute';
import { IotResult,StatusResult } from '../IotResult';
import { IoTHelper } from '../Helper/IoTHelper';
import { launchHelper } from '../Helper/launchHelper';
import { dotnetHelper } from '../Helper/dotnetHelper';
import { IotDevice } from '../IotDevice';
import { IotConfiguration } from '../Configuration/IotConfiguration';
import { FilesValidator } from '../Validator/FilesValidator';

export class IotTemplate extends EntityBase<IotTemplateAttribute> {
  public get StoragePath(): string {
    return this.RootDir+"\\storage";}
  public get TemplatePath(): string {
    return this.RootDir+"\\template";}
  public get ImagePath(): string {
    return this.RootDir+"\\template.fastiot.png";}

  private _mergeDictionary:Map<string,string>= new Map<string,string>();

  constructor(pathFolderSchemas: string
    ){
      super("Template",new IotTemplateAttribute(pathFolderSchemas),pathFolderSchemas);
  }

  public Init(type:EntityType,filePath:string,recoverySourcePath:string|undefined)
  {
    super.Init(type,filePath,recoverySourcePath);
    if(!this.IsValid) return;
    //next
    this.Validate();
    //if(this.IsValid) this.Parse(filePath);
  }

  protected Validate(){
    this._validationErrors=[];
    //checking folder structure
    //FilesValidator
    let filesValidator=new FilesValidator(this._pathFolderSchemas);
    let result = filesValidator.ValidateFiles(this.RootDir,"template.files.schema.json");
    const validationErrors=<Array<string>>result.returnObject;
    this._validationErrors = validationErrors.slice();
    //check id=""
    if (this.Attributes.Id=="") this._validationErrors.push("id cannot be empty");
    // TODO: проверка наличия файлов для dotnetapp.csproj которые внутри
  }

  //------------ Project ------------
  public CreateProject(device:IotDevice, config:IotConfiguration, dstPath:string,
    values:Map<string,string>):IotResult {
    let result:IotResult;
    const errorMsg=`Project not created!`;
    try {
      //Copy
      result=this.Copy(dstPath);
      if(result.Status==StatusResult.Error) {
        result.AddMessage(errorMsg);
        return result;
      }
      //Create MergeDictionary
      this.CreatingMergeDictionary(device,config,dstPath,values);
      //PostCreatingMergeDictionary
      this.PostCreatingMergeDictionary(device,config,dstPath);
      //File Name Replacement
      result=this.FileNameReplacement(dstPath);
      if(result.Status==StatusResult.Error) {
        result.AddMessage(errorMsg);
        return result;
      }
      //Set new name project
      this.SetNewNameProject();
      //PostCreatingMergeDictionary V2
      this.PostCreatingMergeDictionary(device,config,dstPath);
      //FilesToProcess
      result=this.FilesToProcess(dstPath);
      if(result.Status==StatusResult.Error) {
        result.AddMessage(errorMsg);
        return result;
      }
      //Insert Launch
      result=this.InsertLaunchOrTask(dstPath,"launch");
      if(result.Status==StatusResult.Error) {
        result.AddMessage(errorMsg);
        return result;
      }
      //Unique names for Launchs
      result=launchHelper.FixUniqueLabel(`${dstPath}\\.vscode\\launch.json`);
      if(result.Status==StatusResult.Error) {
        result.AddMessage(errorMsg);
        return result;
      }
      //Insert Tasks
      result=this.InsertLaunchOrTask(dstPath,"tasks");
      if(result.Status==StatusResult.Error) {
        result.AddMessage(errorMsg);
        return result;
      }
      //Not necessary. Time setting
      IoTHelper.SetCurrentTimeToFiles(dstPath);
      //
      result= new IotResult(StatusResult.Ok, `Project successfully created!`);
    } catch (err: any){
      //result
      result = new IotResult(StatusResult.Error,errorMsg,err);
    }
    return result;
  }

  public AddConfigurationVscode(device:IotDevice, config:IotConfiguration, dstPath:string,
    values:Map<string,string>):IotResult {
    let result:IotResult;
    const errorMsg=`Launch and tasks not added!`;
    try {
      //Copy
      result=this.CopyOnlyFilesVscode(dstPath+"\\.vscode");
      if(result.Status==StatusResult.Error) {
        result.AddMessage(errorMsg);
        return result;
      }
      //Create MergeDictionary
      this.CreatingMergeDictionary(device,config,dstPath,values);
      //PostCreatingMergeDictionary
      this.PostCreatingMergeDictionary(device,config,dstPath);
      //Insert Launch
      result=this.InsertLaunchOrTask(dstPath,"launch");
      if(result.Status==StatusResult.Error) {
        result.AddMessage(errorMsg);
        return result;
      }
      //Unique names for Launchs
      result=launchHelper.FixUniqueLabel(`${dstPath}\\.vscode\\launch.json`);
      if(result.Status==StatusResult.Error) {
        result.AddMessage(errorMsg);
        return result;
      }
      //Insert Tasks
      result=this.InsertLaunchOrTask(dstPath,"tasks");
      if(result.Status==StatusResult.Error) {
        result.AddMessage(errorMsg);
        return result;
      }
      //Not necessary. Time setting
      IoTHelper.SetCurrentTimeToFiles(`${dstPath}\\.vscode`);
      //launch.id
      result.tag=this._mergeDictionary.get("%{launch.id}");
      //
      result= new IotResult(StatusResult.Ok, `Launch and tasks added successfully`);
    } catch (err: any){
      //result
      result = new IotResult(StatusResult.Error,`Launch and tasks not added! Path is ${dstPath} project`,err);
    }
    return result;
  }
  //---------------------------------

  private FilesToProcess(dstPath:string):IotResult {
    let result:IotResult;
    try {
      //Files
      this.Attributes.FilesToProcess.forEach((name) => {
        const filePath=dstPath+"\\"+ IoTHelper.ReverseSeparatorLinuxToWin(name);
        let text =fs.readFileSync(filePath, 'utf-8');
        text=IoTHelper.MergeWithDictionary(this._mergeDictionary,text);
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
        const oldPath=dstPath+"\\"+IoTHelper.ReverseSeparatorLinuxToWin(key);
        value=IoTHelper.MergeWithDictionary(this._mergeDictionary,value);
        const newPath=dstPath+"\\"+IoTHelper.ReverseSeparatorLinuxToWin(value);
        fs.renameSync(oldPath,newPath);
        //replace in FilesToProcess
        let indexItem=this.Attributes.FilesToProcess.indexOf(key);
        if(indexItem>-1) this.Attributes.FilesToProcess[indexItem]=value;
        //tracking the renaming of the main project file
        if(IoTHelper.GetFileExtensions(newPath)==this.Attributes.ExtMainFileProj)
        {
          const projectMainfilePathFullWin = newPath;
          //newPath - new path of new5.csproj file
          let projectMainfilePathRelativeWin=projectMainfilePathFullWin.substring(dstPath.length);
          let projectMainfilePathRelativeLinux=IoTHelper.ReverseSeparatorWinToLinux(projectMainfilePathRelativeWin);
          projectMainfilePathRelativeWin=IoTHelper.ReverseSeparatorReplacement(projectMainfilePathRelativeWin);
          this._mergeDictionary.set("%{project.mainfile.path.relative.aslinux}",<string>projectMainfilePathRelativeLinux);
          this._mergeDictionary.set("%{project.mainfile.path.relative.aswindows}",<string>projectMainfilePathRelativeWin);
          const projectMainfilePathFullLinux=IoTHelper.ReverseSeparatorWinToLinux(projectMainfilePathFullWin);
          const projectMainfilePathFullWin4=IoTHelper.ReverseSeparatorReplacement(projectMainfilePathFullWin);
          this._mergeDictionary.set("%{project.mainfile.path.full.aslinux}",<string>projectMainfilePathFullLinux);
          this._mergeDictionary.set("%{project.mainfile.path.full.aswindows}",<string>projectMainfilePathFullWin4);
          // => /new5/dotnetapp.csproj
          const lastIndex=projectMainfilePathRelativeLinux.lastIndexOf('/');
          let projectPathRelativeLinux=projectMainfilePathRelativeLinux.substring(0,lastIndex);
          this._mergeDictionary.set("%{project.path.relative.aslinux}",<string>projectPathRelativeLinux);
          let projectPathRelativeWin=IoTHelper.ReverseSeparatorLinuxToWin(projectPathRelativeLinux);
          projectPathRelativeWin=IoTHelper.ReverseSeparatorReplacement(projectPathRelativeWin);
          this._mergeDictionary.set("%{project.path.relative.aswindows}",<string>projectPathRelativeWin);
          //
          const dirProjectWin = path.dirname(projectMainfilePathFullWin);
          this._mergeDictionary.set("%{project.path.full.ascygdrive}",<string>IoTHelper.GetPathAsCygdrive(dirProjectWin));
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

  private SetNewNameProject() {
    //The project name may change after the FileNameReplacement
    //The project name is the file name of the project file
    //new5.csproj => new5
    const projMainfilePathFullLinux=this._mergeDictionary.get("%{project.mainfile.path.full.aslinux}");
    if(projMainfilePathFullLinux)
    {
      // => d:/new5/dotnetapp.csproj
      const lastIndex=projMainfilePathFullLinux.lastIndexOf('/');
      let str=projMainfilePathFullLinux.substring(lastIndex+1);
      // => dotnetapp.csproj
      str=str.substring(0,str.length-this.Attributes.ExtMainFileProj.length);
      // => dotnetapp
      this._mergeDictionary.set("%{project.name}",<string>str);
    }
  }

  private InsertLaunchOrTask(dstPath:string,entity:string /*launch or tasks*/):IotResult {
    let result:IotResult;
    //debug
    const debugFilePath=`${dstPath}\\debug_${entity}_json.txt`;
    try {
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
      data=IoTHelper.MergeWithDictionary(this._mergeDictionary,data);
      //save in file
      fs.writeFileSync(fileEntityPath, data,undefined);
      //result
      fs.removeSync(debugFilePath);
      result = new IotResult(StatusResult.Ok,undefined,undefined);
    } catch (err: any){
      //result
      result = new IotResult(StatusResult.Error,`Unable to create ${entity} for /.vscode. File ${entity}.json or insert_${entity}_*.json. See file ${debugFilePath}`,err);
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
      fs.copyFileSync(this.YAMLFilePath,dstPath+"\\template.fastiot.yaml");
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

  private CreatingMergeDictionary (device:IotDevice, config:IotConfiguration,
    dstPath:string, values:Map<string,string>) {
    this._mergeDictionary.clear();
    //copy values to _mergeDictionary
    values.forEach((value,key) => this._mergeDictionary.set(key,value));
    //NEW or ADD
    let dirProjectWin;
    let projMainfilePathFullWin=this._mergeDictionary.get("%{project.mainfile.path.full.aswindows}");
    let projMainfilePathFullLinux=this._mergeDictionary.get("%{project.mainfile.path.full.aslinux}");
    if((projMainfilePathFullWin)/*||(projMainfilePathFullLinux)*/) {
          //in <= project.mainfile.path.full.aswindows
          //--------------------ADD--------------------
          this._mergeDictionary.set("%{project.mainfile.path.full.aswindows}",projMainfilePathFullWin);
          projMainfilePathFullLinux=IoTHelper.ReverseSeparatorWinToLinux(projMainfilePathFullWin);
          this._mergeDictionary.set("%{project.mainfile.path.full.aslinux}",projMainfilePathFullLinux);
          //next
          dirProjectWin = path.dirname(projMainfilePathFullWin);
          let projectPathRelativeWin= dirProjectWin.substring(dstPath.length);
          if(projectPathRelativeWin=="\\\\") projectPathRelativeWin="";
          this._mergeDictionary.set("%{project.path.relative.aswindows}",projectPathRelativeWin);
          let projectPathRelativeLinux=IoTHelper.ReverseSeparatorWinToLinux(projectPathRelativeWin);
          if(projectPathRelativeLinux=="/") projectPathRelativeLinux="";
          this._mergeDictionary.set("%{project.path.relative.aslinux}",<string>projectPathRelativeLinux);
          let mainFilePathRelativeWin=projMainfilePathFullWin.substring(dstPath.length);
          let mainFilePathRelativeLinux=IoTHelper.ReverseSeparatorWinToLinux(mainFilePathRelativeWin);
          this._mergeDictionary.set("%{project.mainfile.path.relative.aslinux}",<string>mainFilePathRelativeLinux);
          mainFilePathRelativeWin=IoTHelper.ReverseSeparatorReplacement(mainFilePathRelativeWin);
          this._mergeDictionary.set("%{project.mainfile.path.relative.aswindows}",<string>mainFilePathRelativeWin);
          //------------------END_ADD------------------
        }else{
          //--------------------NEW--------------------
          //in <= project.name, project.dotnet.targetframework,dstPath
          let projectMainfilePathRelativeLinux="/"+this.Attributes.MainFileProj;
          this._mergeDictionary.set("%{project.mainfile.path.relative.aslinux}",<string>projectMainfilePathRelativeLinux);
          let projectMainfilePathRelativeWin=IoTHelper.ReverseSeparatorLinuxToWin(projectMainfilePathRelativeLinux);
          projectMainfilePathRelativeWin=IoTHelper.ReverseSeparatorReplacement(projectMainfilePathRelativeWin);
          this._mergeDictionary.set("%{project.mainfile.path.relative.aswindows}",<string>projectMainfilePathRelativeWin);
          const dstPathLinux=IoTHelper.ReverseSeparatorWinToLinux(dstPath);
          const projectMainfilePathFullLinux=`${dstPathLinux}/${this.Attributes.MainFileProj}`;
          this._mergeDictionary.set("%{project.mainfile.path.full.aslinux}",<string>projectMainfilePathFullLinux);
          let projectMainfilePathFullWin=IoTHelper.ReverseSeparatorLinuxToWin(projectMainfilePathFullLinux);
          projectMainfilePathFullWin=IoTHelper.ReverseSeparatorReplacement(projectMainfilePathFullWin);
          this._mergeDictionary.set("%{project.mainfile.path.full.aswindows}",<string>projectMainfilePathFullWin);
          // => /new5/dotnetapp.csproj
          const lastIndex=projectMainfilePathRelativeLinux.lastIndexOf('/');
          let projectPathRelativeLinux=projectMainfilePathRelativeLinux.substring(0,lastIndex);
          this._mergeDictionary.set("%{project.path.relative.aslinux}",<string>projectPathRelativeLinux);
          let projectPathRelativeWin=IoTHelper.ReverseSeparatorLinuxToWin(projectPathRelativeLinux);
          projectPathRelativeWin=IoTHelper.ReverseSeparatorReplacement(projectPathRelativeWin);
          this._mergeDictionary.set("%{project.path.relative.aswindows}",<string>projectPathRelativeWin);
          //
          dirProjectWin=IoTHelper.ReverseSeparatorLinuxToWin(projectMainfilePathFullLinux);
          dirProjectWin = path.dirname(dirProjectWin);
          //------------------END_NEW------------------
        }
    this._mergeDictionary.set("%{project.path.full.ascygdrive}",<string>IoTHelper.GetPathAsCygdrive(dirProjectWin));
    //
    this._mergeDictionary.set("%{project.type}",<string>this.Attributes.TypeProj);
    //device
    this._mergeDictionary.set("%{device.id}",<string>device.IdDevice); 
    let ssh_key= config.Folder.DeviceKeys+"\\"+<string>device?.Account.Identity;
    ssh_key=IoTHelper.ReverseSeparatorReplacement(ssh_key);
    this._mergeDictionary.set("%{device.ssh.key.path.full.aswindows}",ssh_key);
    this._mergeDictionary.set("%{device.ssh.port}",<string>device?.Account.Port);
    this._mergeDictionary.set("%{device.user.debug}",<string>device?.Account.UserName);
    this._mergeDictionary.set("%{device.host}",<string>device?.Account.Host);
    this._mergeDictionary.set("%{device.label}",<string>device?.label);
    this._mergeDictionary.set("%{device.board.name}",<string>device?.Information.BoardName);
    //fastiot
    this._mergeDictionary.set("%{launch.id}", IoTHelper.CreateGuid());
    this._mergeDictionary.set("%{template.id}", this.Attributes.Id);
    //app folder
    const storagePath=IoTHelper.ReverseSeparatorReplacement(this.StoragePath);
    this._mergeDictionary.set("%{template.storage.path.aswindows}",<string>storagePath);
    const appsBuiltInPath=IoTHelper.ReverseSeparatorReplacement(config.Folder.AppsBuiltIn);
    this._mergeDictionary.set("%{extension.apps.builtin.aswindows}",<string>appsBuiltInPath);
    const userName=os.userInfo().username;
    this._mergeDictionary.set("%{os.userinfo.username}",<string>userName);
  }

  private PostCreatingMergeDictionary(device:IotDevice, config:IotConfiguration,
    dstPath:string){
    //dotnet
    if(this.Attributes.TypeProj=="dotnet"){
      //namespace
      const projectName=this._mergeDictionary.get("%{project.name}");
      if(projectName)
        this._mergeDictionary.set("%{project.dotnet.namespace}",<string>dotnetHelper.GetDotNetValidNamespace(projectName));
      //RID Catalog
      const rid=dotnetHelper.GetDotNetRID(<string>device?.Information.OsName,<string>device?.Information.Architecture);
      this._mergeDictionary.set("%{device.dotnet.rid}",<string>rid);
      //target
      let targetFramework=this._mergeDictionary.get("%{project.dotnet.targetframework}");
      if(!targetFramework){
        //Read from dstPath
        const filePath= this._mergeDictionary.get("%{project.mainfile.path.full.aswindows}");
        if (filePath) targetFramework=dotnetHelper.GetTargetFrameworkFromCsprojFile(filePath);
        if(targetFramework) 
          this._mergeDictionary.set("%{project.dotnet.targetframework}",<string>targetFramework);
      }
    }
    //launch. Always last
    const label=IoTHelper.MergeWithDictionary(this._mergeDictionary,config.TemplateTitleLaunch);
    this._mergeDictionary.set("%{launch.label}",<string>label); 
  }

  public FindProjects(dir:string): Array<string>{    
    //search for projects in depth on three levels
    const projects = IoTHelper.GetAllFilesByExt(dir,this.Attributes.ExtMainFileProj);    
    return projects;
  }

}
