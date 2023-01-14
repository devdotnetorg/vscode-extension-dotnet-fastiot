import * as vscode from 'vscode';
//import * as fs from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';
import {IotConfigurationFolder} from './IotConfigurationFolder';
import {IotTemplateCollection} from './Templates/IotTemplateCollection';

export class IotConfiguration {  
  public UsernameAccountDevice:string="";
  public GroupsAccountDevice:string="";
  public TemplateTitleLaunch:string="";
  public Folder: IotConfigurationFolder;
  public Templates: IotTemplateCollection;

  constructor(
    applicationDataPath: string,
    context: vscode.ExtensionContext,
    logCallback:(value:string) =>void,
    versionExt:string
    ){
      this.Folder = new IotConfigurationFolder(applicationDataPath,context);
      this.Templates= new IotTemplateCollection(this.Folder.Templates,this.Folder.Extension+"\\templates\\system",logCallback,versionExt);
    }

}
