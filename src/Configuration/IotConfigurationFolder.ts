import * as vscode from 'vscode';
//import * as fs from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { IoTHelper } from '../Helper/IoTHelper';
import { IotResult,StatusResult } from '../IotResult';
import { Constants } from "../Constants"

export class IotConfigurationFolder {
  //from https://learn.microsoft.com/en-us/dotnet/api/system.environment.specialfolder?view=net-7.0
  public get ApplicationData(): string {
    return this.InitApplicationData();}
  public get DeviceKeys(): string {
    const dir= path.join(this.ApplicationData, "settings", "keys");
    IoTHelper.MakeDirSync(dir);
    return dir;}
  private readonly _extension: string;
  public get Extension(): string {
      return this._extension;}
  public get Templates(): string {
    return path.join(this.ApplicationData, "templates");}
  public get TemplatesSystem(): string {
    const dir= path.join(this.Templates, "system");
    IoTHelper.MakeDirSync(dir);
    return dir;}
  public get TemplatesUser(): string {
    const dir= path.join(this.Templates, "user");
    IoTHelper.MakeDirSync(dir);
    return dir;}
  public get TemplatesCommunity(): string {
    const dir= path.join(this.Templates, "community");
    IoTHelper.MakeDirSync(dir);
    return dir;}
  public get AppsBuiltIn(): string {
    return path.join(this.Extension, "windows", "apps");}
  public get Temp(): string {
    const dir= path.join(this.ApplicationData, "tmp");
    IoTHelper.MakeDirSync(dir);
    return dir;}
  public get Schemas(): string {
    return path.join(this.Extension, "schemas");}
  public get WorkspaceDirectory(): string| undefined {
    return IoTHelper.GetWorkspaceDirectory();}

  constructor(extensionPath: string) {
    this._extension=extensionPath;
    //Clear
    this.ClearTmp();
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
  
  //clearing temporary files
  public ClearTmp() {
    const dir=this.Temp;
	  if (!fs.existsSync(dir)) return;
    fs.emptyDirSync(dir);
  }
}
