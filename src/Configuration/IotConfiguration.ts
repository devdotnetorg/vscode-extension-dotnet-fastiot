import * as vscode from 'vscode';
//import * as fs from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as platformFolders from 'platform-folders';
import { IotResult,StatusResult } from '../IotResult';
import { IotConfigurationFolder } from './IotConfigurationFolder';
import { IotBuiltInConfig } from './IotBuiltInConfig';
import { IoTHelper } from '../Helper/IoTHelper';
import { LogLevel } from '../shared/LogLevel';
import { Constants } from "../Constants"

export class IotConfiguration {

  public get JsonDevices():any {
    return <string>vscode.workspace.getConfiguration().get('fastiot.device.all.JSON');}
  public set JsonDevices(data:any) {
      vscode.workspace.getConfiguration().update('fastiot.device.all.JSON',data,true);}
  public get UsernameAccountDevice():string {
    return <string>vscode.workspace.getConfiguration().get('fastiot.device.account.username');}
  public get GroupAccountDevice():string {
    return <string>vscode.workspace.getConfiguration().get('fastiot.device.account.group');}
  public get TypeKeySshDevice():string {
    const KeySsh = this.InitTypeAndBitsKeySshDevice();
    return KeySsh.TypeKey;}
  public get BitsKeySshDevice():number {
    const KeySsh = this.InitTypeAndBitsKeySshDevice();
    return KeySsh.BitsKey;}
  public get DebugAppFolderDevice():string {
    return <string>vscode.workspace.getConfiguration().get('fastiot.device.debug.app.folder');}
  public get TemplateTitleLaunch():string {
    return <string>vscode.workspace.getConfiguration().get('fastiot.launch.templatetitle');}
  public Folder: IotConfigurationFolder;
  public get IsUpdateEntities():boolean { //Template update
    return <boolean>vscode.workspace.getConfiguration().get('fastiot.isupdate');}
  public get UpdateIntervalEntitiesHours():number { //Template update
    return <number>vscode.workspace.getConfiguration().get('fastiot.updateinterval');
    //return 0;
  }
  private readonly _extVersion:string;
  public get ExtVersion(): string {
    return this._extVersion;}
  private readonly _extMode:vscode.ExtensionMode;
  public get ExtMode(): vscode.ExtensionMode {
    return this._extMode;}
  public BuiltInConfig: IotBuiltInConfig;
  public get DefaultProjectFolder(): string {  
    return this.InitDefaultProjectFolder();}
  public get ListSourceUpdateTemplateCommunity(): string[] {
    return this.InitListSourceUpdateTemplateCommunity();}
  public get LoadTemplatesOnStart():boolean {
    return <boolean>vscode.workspace.getConfiguration().get('fastiot.template.loadonstart');}
  public get DebugMode():boolean {
    return <boolean>vscode.workspace.getConfiguration().get('fastiot.debug');}
  public get Loglevel():LogLevel {
    return <LogLevel>vscode.workspace.getConfiguration().get('fastiot.loglevel');}
  
  constructor(
    context: vscode.ExtensionContext
    ){
      //Get info from context
      this._extVersion=`${context.extension.packageJSON.version}`;
      this._extMode=context.extensionMode;
      const extensionPath=context.extensionUri.fsPath;
      //Built-in config
      this.BuiltInConfig=new IotBuiltInConfig();
      //Folders
      this.Folder = new IotConfigurationFolder(extensionPath);
      }

  /*
  public async Init()
  {
      //Keys of devices-------------------------
      //Migrating key files from a previous version of the extension
      const PreviousKeysFolder:string= <string>vscode.workspace.getConfiguration().get('fastiot.device.pathfolderkeys');
      if(PreviousKeysFolder != "")
      {
        try {
          const srcDir = PreviousKeysFolder;
          const destDir = this.Folder.DeviceKeys;
          // To copy a folder or file, select overwrite accordingly
          fs.copySync(srcDir, destDir);
          vscode.window.showWarningMessage(`Keys for devices from folder ${srcDir} have been moved to folder ${destDir}`);
        } catch (err) {
            console.error(err)
        }
        //Saving settings
        vscode.workspace.getConfiguration().update('fastiot.device.pathfolderkeys',"",true);
      }
  }
  */

  private InitDefaultProjectFolder():string {
     //Get default project folder
     let defaultProjectFolder: string=<string>vscode.workspace.getConfiguration().get('fastiot.template.defaultprojectfolder');
     //default project folder definition
     if(defaultProjectFolder == null||defaultProjectFolder == undefined||defaultProjectFolder == "") 
     {
       defaultProjectFolder=path.join(platformFolders.getDocumentsFolder(), Constants.nameFolderProjects);
       //check folder
       IoTHelper.MakeDirSync(defaultProjectFolder);
       //Saving settings
       vscode.workspace.getConfiguration().update('fastiot.template.defaultprojectfolder',defaultProjectFolder,true);
     }
    return defaultProjectFolder;
  }

  private InitListSourceUpdateTemplateCommunity(): string[] {
    let listSourceUpdateTemplateCommunity:string[]=[];
    try {
      //Get url line for update community template
      let urlLine: string=<string>vscode.workspace.getConfiguration().get('fastiot.template.community.updatesource');
      if(urlLine != null && urlLine != undefined && urlLine != "")
      {
        //Get urls
        let urls=urlLine.split(`;`);
        urls.forEach((url) => {
          url=IoTHelper.StringTrim(url);
          if(url != "") listSourceUpdateTemplateCommunity.push(url);
        });
        urlLine=listSourceUpdateTemplateCommunity.join(`;`);
        //Saving settings
        vscode.workspace.getConfiguration().update('fastiot.template.community.updatesource',urlLine,true);
      }
    } catch (err: any){}
    return listSourceUpdateTemplateCommunity;
  }

  private InitTypeAndBitsKeySshDevice(): {TypeKey: string,BitsKey: number} {
    //check type and bits of key
    let typeKeySshDevice=<string>vscode.workspace.getConfiguration().get('fastiot.device.ssh.key.customtype');
    let bitsKeySshDevice=<number>vscode.workspace.getConfiguration().get('fastiot.device.ssh.key.custombits');
    if(typeKeySshDevice == null||typeKeySshDevice == undefined||typeKeySshDevice == "")
      {
        const sshKeytype=<string>vscode.workspace.getConfiguration().get('fastiot.device.ssh.keytype');
        const sshKeytypeArray=sshKeytype.split('-');
        typeKeySshDevice=sshKeytypeArray[0];
        bitsKeySshDevice=+sshKeytypeArray[1];
      }
    const result: {TypeKey: string,BitsKey: number} = {
      TypeKey: typeKeySshDevice,
      BitsKey:bitsKeySshDevice
    }
    return result;
  }

}
