import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { EntityType } from '../Entity/EntityType';
import { LogLevel } from '../shared/LogLevel';
//block
import { IotBuiltInConfig } from './IotBuiltInConfig';
import { IotConfiguration } from './IotConfiguration';
import { IotConfigurationEntity } from './IotConfigurationEntity';
import { IotConfigurationExtension } from './IotConfigurationExtension';
import { IotConfigurationFolder } from './IotConfigurationFolder';
import { IotConfigurationSbc } from './IotConfigurationSbc';
import { IotConfigurationTemplate } from './IotConfigurationTemplate';
//

export interface IConfigurationExtension {
  Version: string;
  PreviousVersion: string;
  Mode: vscode.ExtensionMode;
  Loglevel:LogLevel;
}
