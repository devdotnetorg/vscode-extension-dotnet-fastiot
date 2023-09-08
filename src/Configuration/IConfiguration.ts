import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IConfigurationFolder } from './IConfigurationFolder';
import { IConfigurationExtension } from './IConfigurationExtension';
import { IConfigurationSbc } from './IConfigurationSbc';
import { IConfigurationEntity } from './IConfigurationEntity';
import { IConfigurationTemplate } from './IConfigurationTemplate';

export interface IConfiguration {
  readonly Folder: IConfigurationFolder;
  Extension: IConfigurationExtension;
  Sbc: IConfigurationSbc;
  Entity: IConfigurationEntity;
  Template: IConfigurationTemplate;

  //*********  [deprecated]  *********//
  UsernameAccountDevice_d:string;
  GroupAccountDevice_d:string;
  JsonDevices_d:any;
  //**********************************//
}
