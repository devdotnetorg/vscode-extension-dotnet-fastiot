import * as vscode from 'vscode';
//import * as fs from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IoTHelper } from '../Helper/IoTHelper';
import { Constants } from "../Constants";
//block
import { IotBuiltInConfig } from './IotBuiltInConfig';
import { IotConfigurationEntity } from './IotConfigurationEntity';
import { IotConfigurationExtension } from './IotConfigurationExtension';
import { IotConfigurationFolder } from './IotConfigurationFolder';
import { IotConfigurationSbc } from './IotConfigurationSbc';
import { IotConfigurationTemplate } from './IotConfigurationTemplate';
//
import { IConfigurationFolder } from './IConfigurationFolder';
import { IConfigurationExtension } from './IConfigurationExtension';
import { IConfigurationSbc } from './IConfigurationSbc';
import { IConfigurationEntity } from './IConfigurationEntity';
import { IConfigurationTemplate } from './IConfigurationTemplate';
//
import { IConfiguration } from './IConfiguration';

export class IotConfiguration implements IConfiguration {
  private _builtInConfig: IotBuiltInConfig;
  public Folder: IConfigurationFolder;
  public Extension: IConfigurationExtension ;
  public Sbc: IConfigurationSbc;
  public Entity: IConfigurationEntity;
  public Template: IConfigurationTemplate;
 
  //*********  [deprecated]  *********//
  public get UsernameAccountDevice_d():string {
    return <string>vscode.workspace.getConfiguration().get('fastiot.device.account.username');}
  public get GroupAccountDevice_d():string {
    return <string>vscode.workspace.getConfiguration().get('fastiot.device.account.group');}
  public get JsonDevices_d():any {
    return <string>vscode.workspace.getConfiguration().get('fastiot.device.all.JSON');}
  public set JsonDevices_d(data:any) {
      vscode.workspace.getConfiguration().update('fastiot.device.all.JSON',data,true);}
  //**********************************//

  constructor(
    context: vscode.ExtensionContext
    ){
      //Build
      //Built-in config
      this._builtInConfig=new IotBuiltInConfig('fastiot.config.JSON');
      //Folders
      this.Folder = new IotConfigurationFolder(context);
      //Extension
      this.Extension= new IotConfigurationExtension(context,this._builtInConfig);
      //Sbc
      this.Sbc = new IotConfigurationSbc(this._builtInConfig,this.Folder);
      //Entity
      this.Entity = new IotConfigurationEntity(this._builtInConfig);
      //Template
      this.Template = new IotConfigurationTemplate(this._builtInConfig);
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

}
