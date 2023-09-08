import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IoT } from '../Types/Enums';
import EntityEnum = IoT.Enums.Entity;

export interface IConfigurationFolder {
  readonly ApplicationData: string;
  readonly KeysSbc: string;
  readonly UdevRules: string;
  readonly Extension: vscode.Uri;
  readonly AppsBuiltIn: string;
  readonly BashScripts: string;
  readonly Temp: string;
  readonly Schemas: string;
  readonly WorkspaceVSCode: string| undefined;
  readonly SaveProjectByDefault: string;
  GetDirTemplates(type:EntityEnum):string;
  ClearTmp():void;
}
