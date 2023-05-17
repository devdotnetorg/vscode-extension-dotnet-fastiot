import * as vscode from 'vscode';
//import * as fs from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { IoTHelper } from '../Helper/IoTHelper';
import { IotResult,StatusResult } from '../IotResult';
import { EntityType } from '..//Entity/EntityType';
import { Constants } from "../Constants"

export class IotConfigurationFolder {
  //from https://learn.microsoft.com/en-us/dotnet/api/system.environment.specialfolder?view=net-7.0
  public get ApplicationData(): string {
    return this.InitApplicationData();}
  public get DeviceKeys(): string {
    return path.join(this.ApplicationData, "settings", "keys");}
  private readonly _extension: string;
  public get Extension(): string {
      return this._extension;}
  public get AppsBuiltIn(): string {
    return path.join(this.Extension, "windows", "apps");}
  public get Temp(): string {
    return path.join(this.ApplicationData, "tmp");}
  public get Schemas(): string {
    return path.join(this.Extension, "schemas");}
  public get WorkspaceDirectory(): string| undefined {
    return IoTHelper.GetWorkspaceDirectory();}

  constructor(extensionPath: string) {
    this._extension=extensionPath;
    this.CreateDirs();
    //Clear
    this.ClearTmp();
  }

  private CreateDirs() {
    try {
      IoTHelper.MakeDirSync(this.ApplicationData);
      IoTHelper.MakeDirSync(this.DeviceKeys);
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
    let applicationDataPath: string=<string>vscode.workspace.getConfiguration().get('fastiot.device.applicationdatafolder');
    //Application folder definition
    if(applicationDataPath == null||applicationDataPath == undefined||applicationDataPath == "") 
    {
      /* Get home directory of the user in Node.js */
      // check the available memory
      const userHomeDir = os.homedir();
      applicationDataPath=path.join(userHomeDir, Constants.nameFolderSettings);
      //Saving settings
      vscode.workspace.getConfiguration().update('fastiot.device.applicationdatafolder',applicationDataPath,true);
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
  
  //clearing temporary files
  public ClearTmp() {
	  if (fs.existsSync(this.Temp)) fs.emptyDirSync(this.Temp);
  }

}
