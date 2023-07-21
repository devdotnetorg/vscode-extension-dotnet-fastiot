import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import { EntityEnum } from './EntityEnum';

export interface IConfigEntityCollection {
  extVersion: string;
  extMode: vscode.ExtensionMode;
  recoverySourcePath: string;
  schemasFolderPath: string;
  tempFolderPath:string;
	lastUpdateTimeInHours:number;
  isUpdate:boolean;
  updateIntervalInHours:number;
  urlsUpdateEntitiesCommunity:string[];
  urlUpdateEntitiesSystem:string;
  getDirEntitiesCallback(type:EntityEnum): string;
  saveLastUpdateHours(value:number):void
}