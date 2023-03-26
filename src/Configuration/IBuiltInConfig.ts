import * as vscode from 'vscode';
//import * as fs from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { IotResult,StatusResult } from '../IotResult';
import { IotConfigurationFolder } from './IotConfigurationFolder';
import { IotTemplateCollection } from '../Templates/IotTemplateCollection';
import { IoTHelper } from '../Helper/IoTHelper';
import { IContexUI } from '../ui/IContexUI';

export interface IBuiltInConfig {
  previousVerExt: string;
}
