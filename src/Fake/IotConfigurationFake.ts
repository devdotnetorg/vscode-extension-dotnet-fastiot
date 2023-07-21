import * as vscode from 'vscode';
//import * as fs from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';
//block
import { IotConfigurationEntityFake } from './IotConfigurationEntityFake';
import { IotConfigurationExtensionFake } from './IotConfigurationExtensionFake';
import { IotConfigurationFolderFake } from './IotConfigurationFolderFake';
import { IotConfigurationSbcFake } from './IotConfigurationSbcFake';
import { IotConfigurationTemplateFake } from './IotConfigurationTemplateFake';
//
import { IConfigurationFolder } from '../Configuration/IConfigurationFolder';
import { IConfigurationExtension } from '../Configuration/IConfigurationExtension';
import { IConfigurationSbc } from '../Configuration/IConfigurationSbc';
import { IConfigurationEntity } from '../Configuration/IConfigurationEntity';
import { IConfigurationTemplate } from '../Configuration/IConfigurationTemplate';
//
import { IConfiguration } from '../Configuration/IConfiguration';

export class IotConfigurationFake implements IConfiguration {
  public Folder: IConfigurationFolder;
  public Extension: IConfigurationExtension ;
  public Sbc: IConfigurationSbc;
  public Entity: IConfigurationEntity;
  public Template: IConfigurationTemplate;
 
  //*********  [deprecated]  *********//
  public get UsernameAccountDevice_d():string {
    return "";}
  public get GroupAccountDevice_d():string {
    return "";}
  public get JsonDevices_d():any {
    return "";}
  public set JsonDevices_d(data:any) {}
  //**********************************//

  constructor(){
    //Build
    //Folders
    this.Folder = new IotConfigurationFolderFake();
    //Extension
    this.Extension= new IotConfigurationExtensionFake();
    //Sbc
    this.Sbc = new IotConfigurationSbcFake();
    //Entity
    this.Entity = new IotConfigurationEntityFake();
    //Template
    this.Template = new IotConfigurationTemplateFake();
  }

}
