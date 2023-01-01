import * as vscode from 'vscode';
//import * as fs from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';
import StreamZip from 'node-stream-zip';
import {IotConfigurationFolder} from './IotConfigurationFolder';
import {IotTemplate} from './IotTemplate';
import {IotTemplateCollection} from './IotTemplateCollection';

export class IotConfiguration {  
  public UsernameAccountDevice:string="";
  public GroupsAccountDevice:string="";
  public TemplateTitleLaunch:string="";
  public Folder: IotConfigurationFolder;
  public Templates: IotTemplateCollection;
  private _outputChannel: vscode.OutputChannel;

  constructor(
    applicationDataPath: string,
    context: vscode.ExtensionContext,
    outputChannel:vscode.OutputChannel
    ){
      this._outputChannel=outputChannel;
      this.Folder = new IotConfigurationFolder(applicationDataPath,context);
      this.Templates= new IotTemplateCollection(this)
    }

    public async Log(value:string):Promise<void> {
      this._outputChannel.append(value);
    }
    
}
