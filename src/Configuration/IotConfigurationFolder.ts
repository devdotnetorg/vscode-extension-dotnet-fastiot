import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import * as platformFolders from 'platform-folders';
import { IoTHelper } from '../Helper/IoTHelper';
import { IotResult,StatusResult } from '../IotResult';
import { EntityType } from '../Entity/EntityType';
import { Constants } from "../Constants"
import { IConfigurationFolder } from './IConfigurationFolder';
//block
import { IotBuiltInConfig } from './IotBuiltInConfig';
import { IotConfiguration } from './IotConfiguration';
import { IotConfigurationEntity } from './IotConfigurationEntity';
import { IotConfigurationExtension } from './IotConfigurationExtension';
import { IotConfigurationSbc } from './IotConfigurationSbc';
import { IotConfigurationTemplate } from './IotConfigurationTemplate';
//

export class IotConfigurationFolder implements IConfigurationFolder{
  //from https://learn.microsoft.com/en-us/dotnet/api/system.environment.specialfolder?view=net-7.0
  public get ApplicationData(): string {
    return this.InitApplicationData();}
  public get KeysSbc(): string {
    return path.join(this.ApplicationData, "settings", "keys");}
  public get UdevRules(): string {
    return path.join(this.ApplicationData, "settings", "udevrules");}
  private readonly _extensionPath: vscode.Uri;
  public get Extension(): vscode.Uri {
      return this._extensionPath;}
  public get AppsBuiltIn(): string {
    return path.join(this.Extension.fsPath, "windows", "apps");}
  public get Temp(): string {
    return path.join(this.ApplicationData, "tmp");}
  public get Schemas(): string {
    return path.join(this.Extension.fsPath, "schemas");}
  public get WorkspaceVSCode(): string| undefined {
    return IoTHelper.GetWorkspaceDirectory();}
  public get SaveProjectByDefault(): string {  
    return this.InitSaveProjectByDefaultFolder();}

  constructor(context: vscode.ExtensionContext) {
    this._extensionPath=context.extensionUri;
    this.CreateDirs();
    //Clear
    this.ClearTmp();
  }

  private CreateDirs() {
    try {
      IoTHelper.MakeDirSync(this.ApplicationData);
      IoTHelper.MakeDirSync(this.KeysSbc);
      IoTHelper.MakeDirSync(this.UdevRules);
      IoTHelper.MakeDirSync(this.Temp);
      //Templates
      IoTHelper.MakeDirSync(this.GetDirTemplates(EntityType.none));
      IoTHelper.MakeDirSync(this.GetDirTemplates(EntityType.system));
      IoTHelper.MakeDirSync(this.GetDirTemplates(EntityType.webapi));
      IoTHelper.MakeDirSync(this.GetDirTemplates(EntityType.community));
      IoTHelper.MakeDirSync(this.GetDirTemplates(EntityType.user));
    } catch (err: any){}
  }

  private InitApplicationData():string {
    //Get Application folder
    let applicationDataPath: string=<string>vscode.workspace.getConfiguration().get('fastiot.sbc.applicationdata.folder');
    //TODO: remove after update
    if(applicationDataPath == null||applicationDataPath == undefined||applicationDataPath == "") {
      applicationDataPath=<string>vscode.workspace.getConfiguration().get('fastiot.device.applicationdatafolder');
      //Saving settings
      vscode.workspace.getConfiguration().update('fastiot.sbc.applicationdata.folder',applicationDataPath,true);
    }
    //Application folder definition
    if(applicationDataPath == null||applicationDataPath == undefined||applicationDataPath == "") 
    {
      /* Get home directory of the user in Node.js */
      // check the available memory
      const userHomeDir = os.homedir();
      applicationDataPath=path.join(userHomeDir, Constants.nameFolderSettings);
      //Saving settings
      vscode.workspace.getConfiguration().update('fastiot.sbc.applicationdata.folder',applicationDataPath,true);
    }
    return applicationDataPath;
  }

  public GetDirTemplates(type:EntityType):string {
    let result:string;
    const dirEntities= path.join(this.ApplicationData, "templates");
    if(type!=EntityType.none) {
      result= path.join(dirEntities, type.toString());
    }else {
      result= dirEntities;
    }
    return result;
  }

  private InitSaveProjectByDefaultFolder():string {
    //Get default project folder
    let defaultProjectFolder: string=<string>vscode.workspace.getConfiguration().get('fastiot.defaultprojectfolder');
    //default project folder definition
    if(defaultProjectFolder == null||defaultProjectFolder == undefined||defaultProjectFolder == "") 
    {
      defaultProjectFolder=path.join(platformFolders.getDocumentsFolder(), Constants.nameFolderProjects);
      //check folder
      IoTHelper.MakeDirSync(defaultProjectFolder);
      //Saving settings
      vscode.workspace.getConfiguration().update('fastiot.defaultprojectfolder',defaultProjectFolder,true);
    }
   return defaultProjectFolder;
 }
  
  //clearing temporary files
  public ClearTmp() {
	  if (fs.existsSync(this.Temp)) fs.emptyDirSync(this.Temp);
  }

}
