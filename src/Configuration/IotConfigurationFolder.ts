import * as vscode from 'vscode';
//import * as fs from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';
import { IoTHelper } from '../Helper/IoTHelper';
import { IotResult,StatusResult } from '../IotResult';

export class IotConfigurationFolder {
  //from https://learn.microsoft.com/en-us/dotnet/api/system.environment.specialfolder?view=net-7.0
  private _applicationData:string;
  public get ApplicationData(): string {
    return this._applicationData;}
  public get DeviceKeys(): string {
    return path.join(this._applicationData, "settings", "keys");}
  private _extension: string;
  public get Extension(): string {
      return this._extension;}
  public get Templates(): string {
    return path.join(this.ApplicationData, "templates");}
  public get TemplatesSystem(): string {
    return path.join(this.Templates, "system");}
  public get TemplatesUser(): string {
    return path.join(this.Templates, "user");}
  public get TemplatesCommunity(): string {
    return path.join(this.Templates, "community");}
  public get AppsBuiltIn(): string {
    return path.join(this.Extension, "windows", "apps");}
  public get Temp(): string {
    return path.join(this.ApplicationData, "tmp");}
  public get Schemas(): string {
    return path.join(this.Extension, "schemas");}
  public get WorkspaceDirectory(): string| undefined {
    return IoTHelper.GetWorkspaceDirectory();}

  constructor(applicationDataPath: string, context: vscode.ExtensionContext) {
    this._extension=context.extensionUri.fsPath;
    this._applicationData=applicationDataPath;
  }

  public CheckingFolders():  IotResult
  {
    let result:IotResult;
    try {
      //Create folders
      IoTHelper.MakeDirSync(this.ApplicationData);
      IoTHelper.MakeDirSync(this.DeviceKeys);
      IoTHelper.MakeDirSync(this.Templates);
      IoTHelper.MakeDirSync(this.TemplatesSystem);
      IoTHelper.MakeDirSync(this.TemplatesUser);
      IoTHelper.MakeDirSync(this.TemplatesCommunity);
      IoTHelper.MakeDirSync(this.Temp);
      //Ok
      result=new IotResult(StatusResult.Ok);
    } catch (err: any){
      result=new IotResult(StatusResult.Error,`Settings loading error. IotConfigurationFolder`,err);
    }
    return result;
  }

  //clearing temporary files
  public ClearTmp() {
    const dir=this.Temp;
	  if (!fs.existsSync(dir)) return;
    fs.emptyDirSync(dir);
  }
}
