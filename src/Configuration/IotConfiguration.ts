import * as vscode from 'vscode';
//import * as fs from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import {IotConfigurationFolder} from './IotConfigurationFolder';
import {IotTemplateCollection} from '../Templates/IotTemplateCollection';

export class IotConfiguration {  
  public UsernameAccountDevice:string="";
  public GroupsAccountDevice:string="";
  public TypeKeySshDevice:string="";
  public BitsKeySshDevice:number=256;
  public TemplateTitleLaunch:string="";
  public Folder: IotConfigurationFolder;
  public Templates: IotTemplateCollection;

  private _context:vscode.ExtensionContext;
  private _logCallback:(value:string) =>void;

  constructor(
    context: vscode.ExtensionContext,
    versionExt:string,
    logCallback:(value:string) =>void,
    ){
      this._logCallback=logCallback;
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
      this.Templates= new IotTemplateCollection(this.Folder.Templates,this.Folder.Extension+"\\templates\\system",logCallback,versionExt);
      this._context=context;
      //Init
      this.Init();
    }

  private Init()
  {
    //Device----------------------------------
    this.UsernameAccountDevice= <string>vscode.workspace.getConfiguration().get('fastiot.device.account.username');	
	  this.GroupsAccountDevice= <string>vscode.workspace.getConfiguration().get('fastiot.device.account.groups');
	  //check type and bits of key
    let typeKeySshDevice=<string>vscode.workspace.getConfiguration().get('fastiot.device.ssh.key.type');	
    let bitsKeySshDevice=<number>vscode.workspace.getConfiguration().get('fastiot.device.ssh.key.bits');	
    const oldTypeKeySshDevice=typeKeySshDevice;
    const oldBitsKeySshDevice=bitsKeySshDevice;
    //making catalog
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
    const oldFormatTitleLaunch="Launch on %DEVICE_LABEL% (%NAME_PROJECT%, %BOARD_NAME%, %USER_DEBUG%)";
    if(this.TemplateTitleLaunch==oldFormatTitleLaunch)
    {
      this.TemplateTitleLaunch="Launch on %{device.label} (%{project.name}, %{device.board.name}, %{device.user.debug})";
      vscode.workspace.getConfiguration().update('fastiot.launch.templatetitle',this.TemplateTitleLaunch,true);
    }
    //Keys of devices-------------------------
    //Migrating key files from a previous version of the extension
	  const PreviousKeysFolder:string= <string>vscode.workspace.getConfiguration().get('fastiot.device.pathfolderkeys');
    if(PreviousKeysFolder != "")
    {
      const srcDir = PreviousKeysFolder;
      const destDir = this.Folder.DeviceKeys;
      // To copy a folder or file, select overwrite accordingly
      try {
        //??? fs.copySync
        fs.copyFileSync(srcDir, destDir);
        } catch (err) {
        console.error(err)
      }
      //Saving settings
      vscode.workspace.getConfiguration().update('fastiot.device.pathfolderkeys',"",true);
      vscode.window.showWarningMessage(`Keys for devices from folder ${srcDir} have been moved to folder ${destDir}`);
    }
    //Clear
	  this.Folder.ClearTmp();
  }

  public LoadTemplates()
  {
    let url:string="";
	  if(this._context.extensionMode==vscode.ExtensionMode.Production)
	  {
		  url="https://raw.githubusercontent.com/devdotnetorg/vscode-extension-dotnet-fastiot/master/templates/system/templatelist.fastiot.yaml";
	  }else{
      //for test
		  url="https://raw.githubusercontent.com/devdotnetorg/vscode-extension-dotnet-fastiot/dev-mono/templates/system/templatelist.fastiot.yaml";
	  }

    const loadTemplates = async () => {
      this._logCallback("-------- Loading templates -------");
      this.Templates.Clear();
      await this.Templates.LoadTemplatesSystem();
      //await this.Templates.UpdateSystemTemplate(url,this.Folder.Temp);
      //await this.Templates.LoadTemplatesUser();
      this._logCallback("----------------------------------");
      };
	  loadTemplates();
  }
}

type P = {
  x: number;
  y: number;
}
