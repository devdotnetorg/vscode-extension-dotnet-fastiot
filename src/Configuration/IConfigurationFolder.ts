import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { EntityEnum } from '../Entity/EntityEnum';

export interface IConfigurationFolder {
  ApplicationData: string;
  KeysSbc: string;
  UdevRules: string;
  Extension: vscode.Uri;
  AppsBuiltIn: string;
  Temp: string;
  Schemas: string;
  WorkspaceVSCode: string| undefined;
  SaveProjectByDefault: string;
  GetDirTemplates(type:EntityEnum):string;
  ClearTmp():void;
}
