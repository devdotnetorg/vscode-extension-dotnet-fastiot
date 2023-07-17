import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { EntityType } from '../Entity/EntityType';
//block
import { IotBuiltInConfig } from './IotBuiltInConfig';
import { IotConfiguration } from './IotConfiguration';
import { IotConfigurationEntity } from './IotConfigurationEntity';
import { IotConfigurationExtension } from './IotConfigurationExtension';
import { IotConfigurationFolder } from './IotConfigurationFolder';
import { IotConfigurationSbc } from './IotConfigurationSbc';
import { IotConfigurationTemplate } from './IotConfigurationTemplate';
//

export interface IConfigurationFolder {
  ApplicationData: string;
  KeysSbc: string;
  UdevRules: string;
  Extension: vscode.Uri;
  AppsBuiltIn: string;
  Temp: string;
  Schemas: string;
  WorkspaceDirectory: string| undefined;
  DefaultProject: string;
  GetDirTemplates(type:EntityType):string;
  ClearTmp():void;
}
