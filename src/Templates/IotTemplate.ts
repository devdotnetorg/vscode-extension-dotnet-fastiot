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

  public Init(type:EntityType,yamlFilePath:string,recoverySourcePath:string|undefined=undefined)
  {
    super.Init(type,yamlFilePath,recoverySourcePath);
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
      //Create MergeDictionary---------------------------------
      this.CreateDictionaryStep1CopyValues(values);
      if(config.DebugMode) this.CreateDumpDictionary(dstPath,"Step1CopyValues");
      this.CreateDictionaryStep2AddDeviceInfo(device,config);
      if(config.DebugMode) this.CreateDumpDictionary(dstPath,"Step2AddDeviceInfo");
      this.CreateDictionaryStep3DependencyProjectType(device);
      if(config.DebugMode) this.CreateDumpDictionary(dstPath,"Step3DependencyProjectType");
      this.CreateDictionaryStep4Additional(config);
      if(config.DebugMode) this.CreateDumpDictionary(dstPath,"Step4Additional");
      //File Name Replacement
      result=this.FileNameReplacement(dstPath);
      if(result.Status==StatusResult.Error) {
        result.AddMessage(errorMsg);
        return result;
      }
      //Set new name project
      this.CreateDictionaryStep5DefinePathToProject(dstPath);
      if(config.DebugMode) this.CreateDumpDictionary(dstPath,"Step5DefinePathToProject");
      this.CreateDictionaryStep6DependencyProjectPath(dstPath);
      if(config.DebugMode) this.CreateDumpDictionary(dstPath,"Step6DependencyProjectPath");
      //last
      this.CreateDictionaryStep7Launch(config);
      if(config.DebugMode) this.CreateDumpDictionary(dstPath,"Step7Launch");
      //End MergeDictionary---------------------------------
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
      //Create MergeDictionary---------------------------------
      this.CreateDictionaryStep1CopyValues(values);
      if(config.DebugMode) this.CreateDumpDictionary(dstPath,"Step1CopyValues");
      this.CreateDictionaryStep2AddDeviceInfo(device,config);
      if(config.DebugMode) this.CreateDumpDictionary(dstPath,"Step2AddDeviceInfo");
      this.CreateDictionaryStep3DependencyProjectType(device);
      if(config.DebugMode) this.CreateDumpDictionary(dstPath,"Step3DependencyProjectType");
      this.CreateDictionaryStep4Additional(config);
      if(config.DebugMode) this.CreateDumpDictionary(dstPath,"Step4Additional");
      this.CreateDictionaryStep5DefinePathToProject(dstPath);
      if(config.DebugMode) this.CreateDumpDictionary(dstPath,"Step5DefinePathToProject");
      this.CreateDictionaryStep6DependencyProjectPath(dstPath);
      if(config.DebugMode) this.CreateDumpDictionary(dstPath,"Step6DependencyProjectPath");
      //last
      this.CreateDictionaryStep7Launch(config);
      if(config.DebugMode) this.CreateDumpDictionary(dstPath,"Step7Launch");
      //End MergeDictionary---------------------------------
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
      result = new IotResult(StatusResult.Ok);
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
          let projectMainfilePathFullWin = newPath;
          projectMainfilePathFullWin=IoTHelper.ReverseSeparatorReplacement(projectMainfilePathFullWin);
          this._mergeDictionary.set("%{project.mainfile.path.full.aswindows}",<string>projectMainfilePathFullWin);
        }
      });
      //result
      result = new IotResult(StatusResult.Ok);
    } catch (err: any){
      //result
      result = new IotResult(StatusResult.Error,"Unable to merge for filesToProcess",err);
    }
    return result;
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
      result = new IotResult(StatusResult.Ok);
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
      result = new IotResult(StatusResult.Ok);
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
      result = new IotResult(StatusResult.Ok);
    } catch (err: any){
      //result
      result = new IotResult(StatusResult.Error,`Error copying .vscode files from ${this.TemplatePath}\.vscode to ${dstPath} folder`,err);
    }
    return result;
  }

  private CreateDictionaryStep1CopyValues (values:Map<string,string>) {
    this._mergeDictionary.clear();
    //copy values to _mergeDictionary
    values.forEach((value,key) => this._mergeDictionary.set(key,value));
  }

  private CreateDictionaryStep2AddDeviceInfo (device:IotDevice, config:IotConfiguration) {
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
  }

  private CreateDictionaryStep3DependencyProjectType(device:IotDevice) {
    this._mergeDictionary.set("%{project.type}",<string>this.Attributes.TypeProj);
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
  }

  private CreateDictionaryStep4Additional(config:IotConfiguration) {
    //fastiot
    this._mergeDictionary.set("%{launch.id}", IoTHelper.CreateGuid());
    this._mergeDictionary.set("%{template.id}", this.Attributes.Id);
    //app folder
    const appsBuiltInPath=IoTHelper.ReverseSeparatorReplacement(config.Folder.AppsBuiltIn);
    this._mergeDictionary.set("%{extension.apps.builtin.aswindows}",<string>appsBuiltInPath);
    const storagePath=IoTHelper.ReverseSeparatorReplacement(this.StoragePath);
    this._mergeDictionary.set("%{template.storage.path.aswindows}",<string>storagePath);
    const userName=os.userInfo().username;
    this._mergeDictionary.set("%{os.userinfo.username}",<string>userName);
  }

  private CreateDictionaryStep5DefinePathToProject(dstPath:string) {
    //always in <= project.mainfile.path.full.aswindows or project.mainfile.path.full.aslinux
    let projMainfilePathFullWin=this._mergeDictionary.get("%{project.mainfile.path.full.aswindows}");
    let projMainfilePathFullLinux=this._mergeDictionary.get("%{project.mainfile.path.full.aslinux}");
    if(projMainfilePathFullWin) {
      //win=>linux
      let regex = /\\\\/g;
      projMainfilePathFullWin = projMainfilePathFullWin.replace(regex, "\\");
      projMainfilePathFullLinux=IoTHelper.ReverseSeparatorWinToLinux(projMainfilePathFullWin);
      this._mergeDictionary.set("%{project.mainfile.path.full.aslinux}",projMainfilePathFullLinux);
    }else if(projMainfilePathFullLinux) {
      //linux=>win
      projMainfilePathFullWin=IoTHelper.ReverseSeparatorLinuxToWin(projMainfilePathFullLinux);
      projMainfilePathFullWin=IoTHelper.ReverseSeparatorReplacement(projMainfilePathFullWin);
      this._mergeDictionary.set("%{project.mainfile.path.full.aswindows}",projMainfilePathFullWin);
    }
    //Project name
    //The project name may change after the FileNameReplacement
    //The project name is the file name of the project file
    //new5.csproj => new5
    // => d:/new5/dotnetapp.csproj
    let projectName=this._mergeDictionary.get("%{project.name}");
    if(!projectName&&projMainfilePathFullWin) {
      const lastIndex=projMainfilePathFullWin.lastIndexOf('\\');
      let str=projMainfilePathFullWin.substring(lastIndex+1);
      // => dotnetapp.csproj
      str=str.substring(0,str.length-this.Attributes.ExtMainFileProj.length);
      // => dotnetapp
      this._mergeDictionary.set("%{project.name}",<string>str);
    } 
  }

  private CreateDictionaryStep6DependencyProjectPath(dstPath:string) {
    //in
    let projMainfilePathFullWin=this._mergeDictionary.get("%{project.mainfile.path.full.aswindows}");
    if(!projMainfilePathFullWin) return;
    //main
    let regex = /\\\\/g;
    projMainfilePathFullWin = projMainfilePathFullWin.replace(regex, "\\");
    //
    let dirProjectWin = path.dirname(projMainfilePathFullWin);
    let projectPathRelativeWin= dirProjectWin.substring(dstPath.length);
    this._mergeDictionary.set("%{project.path.relative.aswindows}",projectPathRelativeWin);
    let projectPathRelativeLinux=IoTHelper.ReverseSeparatorWinToLinux(projectPathRelativeWin);
    this._mergeDictionary.set("%{project.path.relative.aslinux}",<string>projectPathRelativeLinux);
    let mainFilePathRelativeWin=projMainfilePathFullWin.substring(dstPath.length);
    let mainFilePathRelativeLinux=IoTHelper.ReverseSeparatorWinToLinux(mainFilePathRelativeWin);
    this._mergeDictionary.set("%{project.mainfile.path.relative.aslinux}",<string>mainFilePathRelativeLinux);
    mainFilePathRelativeWin=IoTHelper.ReverseSeparatorReplacement(mainFilePathRelativeWin);
    this._mergeDictionary.set("%{project.mainfile.path.relative.aswindows}",<string>mainFilePathRelativeWin);
    //cygdrive
    this._mergeDictionary.set("%{project.path.full.ascygdrive}",<string>IoTHelper.GetPathAsCygdrive(dirProjectWin));
  }

  private CreateDictionaryStep7Launch(config:IotConfiguration) {
    //launch. Always last
    const label=IoTHelper.MergeWithDictionary(this._mergeDictionary,config.TemplateTitleLaunch);
    this._mergeDictionary.set("%{launch.label}",<string>label);
  }

  public FindProjects(dir:string): Array<string>{    
    //search for projects in depth on three levels
    const projects = IoTHelper.GetAllFilesByExt(dir,this.Attributes.ExtMainFileProj);    
    return projects;
  }

  private CreateDumpDictionary(dstPath:string, name:string="dump") {
    try {
      const currentDate: Date = new Date();
      const dateString: string = `${currentDate.getHours()}-${currentDate.getMinutes()}-${currentDate.getSeconds()}_${currentDate.getMilliseconds()}`;
      const filePath=`${dstPath}\\${dateString}-${name}.txt`;
      //save in file
      let data="";
      let line="";
      this._mergeDictionary.forEach((value,key) => {
        line=`"${key}" => "${value}"\n`;
        data=data+line;
      });
      fs.writeFileSync(filePath, data,undefined);
    } catch (err: any){
      console.log(err);
    }
  }

}
