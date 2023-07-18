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
  UsernameDebugAccount:string;
  GroupsDebugAccount:string[];
  UsernameManagementAccount:string;
  GroupsManagementAccount:string[];
  TypeKeySsh:string;
  BitsKeySsh:number;
  DebugAppFolder:string;
  FileNameUdevRules:string;
  ListUdevRulesFiles:string[];
  PreviousHostname: string;
  ProfilesSBCJson:any;
  GetUdevRulesFile(fileName:string, isTest?:boolean): IotResult;
}
