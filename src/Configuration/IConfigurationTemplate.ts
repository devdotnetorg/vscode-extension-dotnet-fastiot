import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface IConfigurationTemplate {
  TitleLaunch:string;
  ListSourceUpdateCommunity: string[];
  LoadOnStart:boolean;
  LastUpdateTimeInHours: number;
}
