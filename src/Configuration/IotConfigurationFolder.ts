import * as vscode from 'vscode';
//import * as fs from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';
import { MakeDirSync } from '../Helper/IoTHelper';

export class IotConfigurationFolder {
  //from https://learn.microsoft.com/en-us/dotnet/api/system.environment.specialfolder?view=net-7.0
  private _applicationData:string;
  public get ApplicationData(): string {
    return this._applicationData;}
  private _context: vscode.ExtensionContext;
  //
  public get DeviceKeys(): string {
    return this._applicationData+"\\settings\\keys";}
  public get Extension(): string {
      return this._context.extensionUri.fsPath;}
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

  constructor(
    applicationDataPath: string,
    context: vscode.ExtensionContext
    ){
      this._applicationData=applicationDataPath;
      this._context=context;
      //Create folders
      MakeDirSync(this.ApplicationData);
      MakeDirSync(this.DeviceKeys);
      MakeDirSync(this.TemplatesSystem);
      MakeDirSync(this.TemplatesUser);
      MakeDirSync(this.TemplatesCommunity);
      MakeDirSync(this.Temp);
    }

  //clearing temporary files
  public ClearTmp() {
    const dir=this.Temp;
	  if (!fs.existsSync(dir)) return;
    fs.emptyDirSync(dir);
  }
}