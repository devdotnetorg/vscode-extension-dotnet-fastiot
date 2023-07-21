import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { EntityType } from '../Entity/EntityType';
import { LogLevel } from '../shared/LogLevel';
import { IotResult,StatusResult } from '../IotResult';
//block
import { IotBuiltInConfig } from './IotBuiltInConfig';
import { IotConfiguration } from './IotConfiguration';
import { IotConfigurationEntity } from './IotConfigurationEntity';
import { IotConfigurationExtension } from './IotConfigurationExtension';
import { IotConfigurationFolder } from './IotConfigurationFolder';
import { IotConfigurationSbc } from './IotConfigurationSbc';
import { IotConfigurationTemplate } from './IotConfigurationTemplate';
//

export interface IConfigurationSbc {
  DebugUserNameAccount:string;
  DebugGroupsAccount:string[];
  ManagementUserNameAccount:string;
  ManagementGroupsAccount:string[];
  SshKeyType:string;
  SshKeyBits:number;
  DebugAppFolder:string;
  FileNameUdevRules:string;
  ListFilesUdevRules:string[];
  PreviousHostnameWhenAdding: string;
  ProfilesSBCJson:any;
  GetFileUdevRules(fileName:string, isTest?:boolean): IotResult;
}
