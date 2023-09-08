import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface IConfigurationTemplate {
  readonly TitleLaunch:string;
  readonly ListSourceUpdateCommunity: string[];
  readonly LoadOnStart:boolean;
  LastUpdateTimeInHours: number;
}
