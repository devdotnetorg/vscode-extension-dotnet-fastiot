import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import { IoT } from '../Types/Enums';
import EntityEnum = IoT.Enums.Entity;

export interface IConfigEntityCollection {
  readonly extVersion: string;
  readonly extMode: vscode.ExtensionMode;
  readonly recoverySourcePath: string;
  readonly schemasFolderPath: string;
  readonly tempFolderPath:string;
	readonly lastUpdateTimeInHours:number;
  readonly isUpdate:boolean;
  readonly updateIntervalInHours:number;
  readonly urlsUpdateEntitiesCommunity:string[];
  readonly urlUpdateEntitiesSystem:string;
  getDirEntitiesCallback(type:EntityEnum): string;
  saveLastUpdateHours(value:number):void
}
