import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IoT } from '../Types/Enums';
import EntityEnum = IoT.Enums.Entity;

export interface IConfigurationFolder {
  ApplicationData: string;
  KeysSbc: string;
  UdevRules: string;
  Extension: vscode.Uri;
  AppsBuiltIn: string;
  BashScripts: string;
  Temp: string;
  Schemas: string;
  WorkspaceVSCode: string| undefined;
  SaveProjectByDefault: string;
  GetDirTemplates(type:EntityEnum):string;
  ClearTmp():void;
}
