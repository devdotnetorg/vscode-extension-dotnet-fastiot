import * as vscode from 'vscode';
//import * as fs from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';
import StreamZip from 'node-stream-zip';
import { MakeDirSync } from './Helper/IoTHelper';

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
  public get TemplatesUser(): string {
    return this.ApplicationData+"\\templates\\user";}
  public get TemplatesDownload(): string {
    return this.ApplicationData+"\\templates\\download";}
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
      MakeDirSync(this.TemplatesUser);
      MakeDirSync(this.TemplatesDownload);
      MakeDirSync(this.Temp);
    }

  /*
  public async CheckAppcwRsync():Promise<void> {	
    const checkDir=this.AppsBuiltIn+"\\settings\\apps\\cwrsync";
    const pathCwRsyncZip=this.Extension+"\\windows\\apps\\cwrsync.zip";
    if (fs.existsSync(checkDir+"\\rsync.exe")&&fs.existsSync(checkDir+"\\ssh.exe")) return;
    //Put App cwRsync
    const zip = new StreamZip.async({ file: pathCwRsyncZip });
    const count = await zip.extract(null, checkDir);
    console.log(`Extracted ${count} entries`);
    await zip.close();
  }
  */

  //clearing temporary files
  public ClearTmp() {
    const dir=this.Temp;
	  if (!fs.existsSync(dir)) return;
    fs.emptyDirSync(dir);
  }
}
