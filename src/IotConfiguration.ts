import * as vscode from 'vscode';
//import * as fs from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';
import StreamZip from 'node-stream-zip';
import {IotConfigurationFolder} from './IotConfigurationFolder';
import {IotTemplate} from './IotTemplate';

export class IotConfiguration {  
  public UsernameAccountDevice:string="";
  public GroupsAccountDevice:string="";
  public TemplateTitleLaunch:string="";
  public Folder: IotConfigurationFolder;
  constructor(
    applicationDataFolder: string,
    context: vscode.ExtensionContext             
    ){
      this.Folder = new IotConfigurationFolder(applicationDataFolder,context);
      //TEST
      const path=this.Folder.Extension+"\\templates\\dotnet-console";
      let template = new IotTemplate(path);
      
    }

}
