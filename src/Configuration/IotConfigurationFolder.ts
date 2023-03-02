import * as vscode from 'vscode';
//import * as fs from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';
import {IoTHelper} from '../Helper/IoTHelper';

export class IotConfigurationFolder {
  //from https://learn.microsoft.com/en-us/dotnet/api/system.environment.specialfolder?view=net-7.0
  private _applicationData:string;
  public get ApplicationData(): string {
    return this._applicationData;}
  public get DeviceKeys(): string {
    return this._applicationData+"\\settings\\keys";}
  private _extension: string;
  public get Extension(): string {
      return this._extension;}
  public get Templates(): string {
    return this.ApplicationData+"\\templates";}
  public get TemplatesSystem(): string {
    return this.Templates+"\\system";}
  public get TemplatesUser(): string {
    return this.Templates+"\\user";}
  public get TemplatesCommunity(): string {
    return this.Templates+"\\community";}
  public get AppsBuiltIn(): string {
    return this.Extension+"\\windows\\apps";}
  public get Temp(): string {
    return this.ApplicationData+"\\tmp";}
  public get Schemas(): string {
    return this.Extension+"\\schemas";}

  constructor(
    applicationDataPath: string,
    context: vscode.ExtensionContext
    ){
      this._extension=context.extensionUri.fsPath;
      this._applicationData=applicationDataPath;
      //Create folders
      IoTHelper.MakeDirSync(this.ApplicationData);
      IoTHelper.MakeDirSync(this.DeviceKeys);
      IoTHelper.MakeDirSync(this.TemplatesSystem);
      IoTHelper.MakeDirSync(this.TemplatesUser);
      IoTHelper.MakeDirSync(this.TemplatesCommunity);
      IoTHelper.MakeDirSync(this.Temp);
    }

  //clearing temporary files
  public ClearTmp() {
    const dir=this.Temp;
	  if (!fs.existsSync(dir)) return;
    fs.emptyDirSync(dir);
  }
}
