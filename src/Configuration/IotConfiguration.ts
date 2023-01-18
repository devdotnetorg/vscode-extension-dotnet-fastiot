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
  public TemplateTitleLaunch:string="";
  public Folder: IotConfigurationFolder;
  public Templates: IotTemplateCollection;

  private _context:vscode.ExtensionContext;

  constructor(
    context: vscode.ExtensionContext,
    logCallback:(value:string) =>void,
    versionExt:string
    ){
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
      this.Init(logCallback);
    }

  private Init(logCallback:(value:string) =>void)
  {
    this.UsernameAccountDevice= <string>vscode.workspace.getConfiguration().get('fastiot.device.account.username');	
	  this.GroupsAccountDevice= <string>vscode.workspace.getConfiguration().get('fastiot.device.account.groups');
	  this.TemplateTitleLaunch= <string>vscode.workspace.getConfiguration().get('fastiot.launch.templatetitle');
	  //replace old format
    const oldFormatTitleLaunch="Launch on %DEVICE_LABEL% (%NAME_PROJECT%, %BOARD_NAME%, %USER_DEBUG%)";
    if(this.TemplateTitleLaunch==oldFormatTitleLaunch)
    {
      this.TemplateTitleLaunch="Launch on %{device.label} (%{project.name}, %{device.board.name}, %{device.user.debug})";
      vscode.workspace.getConfiguration().update('fastiot.launch.templatetitle',this.TemplateTitleLaunch,true);
    }
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
	  //Templates
	  let url:string="";
	  if(this._context.extensionMode==vscode.ExtensionMode.Production)
	  {
		  url="https://raw.githubusercontent.com/devdotnetorg/vscode-extension-dotnet-fastiot/master/templates/system/templatelist.fastiot.yaml";
	  }else{
		  url="https://raw.githubusercontent.com/devdotnetorg/vscode-extension-dotnet-fastiot/dev-mono/templates/system/templatelist.fastiot.yaml";
	  }
	  //for test
	  url="https://raw.githubusercontent.com/devdotnetorg/vscode-extension-dotnet-fastiot/dev-mono/templates/system/templatelist.fastiot.yaml";
	  //
    const LoadTemplates = async () => {
      await this.Templates.LoadTemplatesSystem();
      //await this.Templates.UpdateSystemTemplate(url,this.Folder.Temp);
      //await this.Templates.LoadTemplatesUser();
      //Logs
      logCallback("----------------------------------");
      };
	  LoadTemplates();
	//
  }

}
