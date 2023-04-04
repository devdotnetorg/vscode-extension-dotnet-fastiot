import * as vscode from 'vscode';
//import * as fs from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { IotResult,StatusResult } from '../IotResult';
import { IotConfigurationFolder } from './IotConfigurationFolder';
import { IotBuiltInConfig } from './IotBuiltInConfig';
import { IotTemplateCollection } from '../Templates/IotTemplateCollection';
import { IoTHelper } from '../Helper/IoTHelper';
import { IContexUI } from '../ui/IContexUI';
import { compare } from 'compare-versions';
import * as platformFolders from 'platform-folders';

//TODO Запихать устроства

export class IotConfiguration {
  public UsernameAccountDevice:string="";
  public GroupAccountDevice:string="";
  public TypeKeySshDevice:string="";
  public BitsKeySshDevice:number=256;
  public TemplateTitleLaunch:string="";
  public Folder: IotConfigurationFolder;
  public Templates: IotTemplateCollection;
  public IsUpdateTemplates:boolean;
  public UpdateIntervalTemplatesHours:number;
  private _contextUI:IContexUI;
  private _extVersion:string;
  public get ExtVersion(): string {
    return this._extVersion;}
  private _extMode:vscode.ExtensionMode;
  public get ExtMode(): vscode.ExtensionMode {
    return this._extMode;}
  public BuiltInConfig: IotBuiltInConfig;
  private _defaultProjectFolder:string;
  public get DefaultProjectFolder(): string {
    return this._defaultProjectFolder;}
  private _listSourceUpdateTemplateCommunity:string[];
  public get ListSourceUpdateTemplateCommunity(): string[] {
    return this._listSourceUpdateTemplateCommunity;}

  constructor(
    context: vscode.ExtensionContext,
    contextUI:IContexUI
    ){
      //UI
      this._contextUI=contextUI;
      //Get info from context
      this._extVersion=`${context.extension.packageJSON.version}`;
      this._extMode=context.extensionMode;
      //Template update
      this.IsUpdateTemplates=<boolean>vscode.workspace.getConfiguration().get('fastiot.template.isupdate');
      this.UpdateIntervalTemplatesHours=<number>vscode.workspace.getConfiguration().get('fastiot.template.updateinterval');
      //Built-in config
      const configJson:any=vscode.workspace.getConfiguration().get('fastiot.config.JSON');
      this.BuiltInConfig=new IotBuiltInConfig(configJson);
      //Main
      //Get Application folder
      let applicationDataPath: string=<string>vscode.workspace.getConfiguration().get('fastiot.device.applicationdatafolder');
      //Application folder definition
      if(applicationDataPath == null||applicationDataPath == undefined||applicationDataPath == "") 
      {
        /* Get home directory of the user in Node.js */
        // check the available memory
        const userHomeDir = os.homedir();
        applicationDataPath=path.join(userHomeDir, "fastiot");
        //Saving settings
        vscode.workspace.getConfiguration().update('fastiot.device.applicationdatafolder',applicationDataPath,true);
      }
      //Folders
      this.Folder = new IotConfigurationFolder(applicationDataPath,context);
      const result=this.Folder.CheckingFolders();
      if(result.Status!=StatusResult.Ok) {
        this._contextUI.Output(result);
        //return;
      }
      //Templates
      this.Templates= new IotTemplateCollection(this.Folder.Templates,
        path.join(this.Folder.Extension, "templates", "system"),
        this.ExtVersion,this.Folder.Schemas,this._contextUI,this);
      //Get default project folder
      let defaultProjectFolder: string=<string>vscode.workspace.getConfiguration().get('fastiot.template.defaultprojectfolder');
      //default project folder definition
      if(defaultProjectFolder == null||defaultProjectFolder == undefined||defaultProjectFolder == "") 
      {
        defaultProjectFolder=path.join(platformFolders.getDocumentsFolder(), "Projects");
        //check folder
        IoTHelper.MakeDirSync(defaultProjectFolder);
        //Saving settings
        vscode.workspace.getConfiguration().update('fastiot.template.defaultprojectfolder',defaultProjectFolder,true);
      }
      //set
      this._defaultProjectFolder=defaultProjectFolder;
      //Urls
      this._listSourceUpdateTemplateCommunity=[];
    }

  public async Init()
  {
    try {
      //Device----------------------------------
      this.UsernameAccountDevice= <string>vscode.workspace.getConfiguration().get('fastiot.device.account.username');	
      this.GroupAccountDevice= <string>vscode.workspace.getConfiguration().get('fastiot.device.account.group');
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
      this.TypeKeySshDevice=typeKeySshDevice;
      this.BitsKeySshDevice=bitsKeySshDevice;
      //Launch----------------------------------
      this.TemplateTitleLaunch= <string>vscode.workspace.getConfiguration().get('fastiot.launch.templatetitle');
      //Keys of devices-------------------------
      /*
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
      */
      //Templates-------------------------------
      //Get url line for update community template
      let urlLine: string=<string>vscode.workspace.getConfiguration().get('fastiot.template.community.updatesource');
      if(urlLine != null && urlLine != undefined && urlLine != "") 
      {
        //Get urls
        let urls=urlLine.split(`;`);
        urls.forEach((url) => {
          url=IoTHelper.StringTrim(url);
          if(url != "") this._listSourceUpdateTemplateCommunity.push(url);
        });
        urlLine=this._listSourceUpdateTemplateCommunity.join(`;`);
        //Saving settings
        vscode.workspace.getConfiguration().update('fastiot.template.community.updatesource',urlLine,true);
      }
      //Clear
      this.Folder.ClearTmp();
      //Load
      const loadTemplatesOnStart =  <boolean>vscode.workspace.getConfiguration().get('fastiot.template.loadonstart');
      if(loadTemplatesOnStart) this.Templates.LoadTemplatesAsync();
      //Checking if templates need to be updated after updating an extension
      const isNeedUpgrade=compare(`${this.ExtVersion}`,`${this.BuiltInConfig.PreviousVerExt}`, '>');
      if(isNeedUpgrade)
        {
          this.Templates.RestoreSystemTemplates(true);
          this.BuiltInConfig.PreviousVerExt=this.ExtVersion;
          this.BuiltInConfig.Save();
        }
    } catch (err: any){
      const result=new IotResult(StatusResult.Error,`Settings loading error`,err);
      this._contextUI.Output(result);
    }
  }
  
}
