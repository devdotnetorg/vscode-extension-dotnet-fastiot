import * as vscode from 'vscode';
//import * as fs from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import {IotResult,StatusResult } from '../IotResult';
import {IotConfigurationFolder} from './IotConfigurationFolder';
import {IotTemplateCollection} from '../Templates/IotTemplateCollection';
import { IoTHelper } from '../Helper/IoTHelper';
import {IContexUI} from '../ui/IContexUI';

export class IotConfiguration {
  public UsernameAccountDevice:string="";
  public GroupsAccountDevice:string="";
  public TypeKeySshDevice:string="";
  public BitsKeySshDevice:number=256;
  public TemplateTitleLaunch:string="";
  public Folder: IotConfigurationFolder;
  public Templates: IotTemplateCollection;
  public IsUpdateTemplates:boolean;
  public UpdateIntervalTemplatesHours:number;
  public LastUpdateTemplatesHours:number;
  private _contextUI:IContexUI;
  private _extVersion:string;
  public get ExtVersion(): string {
    return this._extVersion;}
  private _extMode:vscode.ExtensionMode;
  public get ExtMode(): vscode.ExtensionMode {
    return this._extMode;}

  constructor(
    context: vscode.ExtensionContext,
    contextUI:IContexUI
    ){
      //Get info from context
      this._extVersion=`${context.extension.packageJSON.version}`;
      this._extMode=context.extensionMode;
      //UI
      this._contextUI=contextUI;
      //Get Application folder
      let applicationDataPath: string=<string>vscode.workspace.getConfiguration().get('fastiot.device.applicationdatafolder');
      //Application folder definition
      if(applicationDataPath == null||applicationDataPath == undefined||applicationDataPath == "") 
      {
        /* Get home directory of the user in Node.js */
        // check the available memory
        const userHomeDir = os.homedir();
        applicationDataPath=userHomeDir+"\\fastiot";
        //Saving settings
        vscode.workspace.getConfiguration().update('fastiot.device.applicationdatafolder',applicationDataPath,true);
      }
      //
      this.Folder = new IotConfigurationFolder(applicationDataPath,context);
      this.Templates= new IotTemplateCollection(this.Folder.Templates,
        this.Folder.Extension+"\\templates\\system",this.ExtVersion,
        this.Folder.Schemas,this._contextUI);
      
      //Template update
      this.IsUpdateTemplates=<boolean>vscode.workspace.getConfiguration().get('fastiot.template.isupdate');
      this.UpdateIntervalTemplatesHours=<number>vscode.workspace.getConfiguration().get('fastiot.template.updateinterval');
      this.LastUpdateTemplatesHours=<number>vscode.workspace.getConfiguration().get('fastiot.template.lastupdate');
    }

  public async Init()
  {
    //Device----------------------------------
    this.UsernameAccountDevice= <string>vscode.workspace.getConfiguration().get('fastiot.device.account.username');	
	  this.GroupsAccountDevice= <string>vscode.workspace.getConfiguration().get('fastiot.device.account.groups');
	  //check type and bits of key
    let typeKeySshDevice=<string>vscode.workspace.getConfiguration().get('fastiot.device.ssh.key.type');	
    let bitsKeySshDevice=<number>vscode.workspace.getConfiguration().get('fastiot.device.ssh.key.bits');	
    const oldTypeKeySshDevice=typeKeySshDevice;
    const oldBitsKeySshDevice=bitsKeySshDevice;
    //making dictionary
    let keySshDictionary=new Map<string,Array<number>>(); 
    keySshDictionary.set("ed25519",[256]);
    keySshDictionary.set("ecdsa",[256, 384, 521]);
    keySshDictionary.set("dsa",[1024]);
    keySshDictionary.set("rsa",[1024, 2048, 3072, 4096]);
    const arrayBits=keySshDictionary.get(typeKeySshDevice);
    if(arrayBits){
      //find
      if(!arrayBits.includes(bitsKeySshDevice))
        bitsKeySshDevice=arrayBits[arrayBits.length-1];
    } else{
      typeKeySshDevice="ed25519";
      bitsKeySshDevice=256;
    }
    let msg="";
    if(oldTypeKeySshDevice!=typeKeySshDevice){
      msg=`Invalid ssh key type: ${oldTypeKeySshDevice}. The ssh key type parameter has been changed to: ${typeKeySshDevice}.\n`;
      vscode.workspace.getConfiguration().update('fastiot.device.ssh.key.type',typeKeySshDevice,true);
    }
    if(oldBitsKeySshDevice!=bitsKeySshDevice){
      msg=msg+`Invalid bits value for key: ${oldTypeKeySshDevice}. The bits parameter has been changed to: ${bitsKeySshDevice}`;
      vscode.workspace.getConfiguration().update('fastiot.device.ssh.key.bits',<number>bitsKeySshDevice,true);
    }
    this.TypeKeySshDevice=typeKeySshDevice;
    this.BitsKeySshDevice=bitsKeySshDevice;
    if(msg!="") vscode.window.showErrorMessage(msg);
    //Launch----------------------------------
    this.TemplateTitleLaunch= <string>vscode.workspace.getConfiguration().get('fastiot.launch.templatetitle');
	  //replace old format
    //const oldFormatTitleLaunch="Launch on %DEVICE_LABEL% (%NAME_PROJECT%, %BOARD_NAME%, %USER_DEBUG%)";
    const oldFormatTitleLaunch="%DEVICE_LABEL%";
    if(this.TemplateTitleLaunch.includes(oldFormatTitleLaunch))
    {
      this.TemplateTitleLaunch="Launch on %{device.label} (%{project.name}, %{device.board.name}, %{device.user.debug})";
      vscode.workspace.getConfiguration().update('fastiot.launch.templatetitle',this.TemplateTitleLaunch,true);
    }
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
    //Templates-------------------------------
    //Clear
    this.Folder.ClearTmp();
    //Load
    const loadTemplatesOnStart =  <boolean>vscode.workspace.getConfiguration().get('fastiot.template.loadonstart');
    if(loadTemplatesOnStart) this.LoadTemplatesAsync();
  }
  
  public async LoadTemplatesAsync(force:boolean=false)
  {
    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "Loading ... ",
      cancellable: false
    }, (progress, token) => {
      //token.onCancellationRequested(() => {
      //  console.log("User canceled the long running operation");
      //});
      return new Promise(async (resolve, reject) => {
        //main code
        progress.report({ message: "Preparing to load",increment: 20 }); //20
        //Preparing
        let result= new IotResult(StatusResult.None,undefined,undefined);
        this.Templates.Clear();
        let url:string="";
        if(this.ExtMode==vscode.ExtensionMode.Production)
        {
          url="https://raw.githubusercontent.com/devdotnetorg/vscode-extension-dotnet-fastiot/master/templates/system/templatelist.fastiot.yaml";
        }else{
          //for test
          url="https://raw.githubusercontent.com/devdotnetorg/vscode-extension-dotnet-fastiot/dev/templates/system/templatelist.fastiot.yaml";
        }
        this._contextUI.Output("-------- Loading templates -------");
        //Loading system templates
        progress.report({ message: "Loading system templates",increment: 20 }); //40
        await this.Templates.LoadTemplatesSystem();
        //Updating system templates
        progress.report({ message: "Updating system templates",increment: 20 }); //60
        //To get the number of hours since Unix epoch, i.e. Unix timestamp:
        const dateNow=Math.floor(Date.now() / 1000/ 3600);
        const TimeHasPassedHours=dateNow-this.LastUpdateTemplatesHours;
        this._contextUI.Output("Updating system templates");
        if(force||(this.IsUpdateTemplates&&(TimeHasPassedHours>=this.UpdateIntervalTemplatesHours))){
          result=await this.Templates.UpdateSystemTemplate(url,this.Folder.Temp);
          this._contextUI.Output(result.toString());
          //timestamp of last update
          if(result.Status==StatusResult.Ok){
            vscode.workspace.getConfiguration().update('fastiot.template.lastupdate',<number>dateNow,true);
          }
        } else this._contextUI.Output(`Disabled or less than ${this.UpdateIntervalTemplatesHours} hour(s) have passed since the last update.`);
        //Loading custom templates
        progress.report({ message: "Loading custom templates",increment: 20 }); //80
        await this.Templates.LoadTemplatesUser();
        const endMsg=`${this.Templates.Count} template(s) available.`;
        this._contextUI.Output(endMsg);
        this._contextUI.Output("----------------------------------");
        progress.report({ message: "Templates loaded" , increment: 20 }); //100
        await IoTHelper.Sleep(1000);
        resolve(endMsg);
        //end
      });
    });

  }
}

type P = {
  x: number;
  y: number;
}
