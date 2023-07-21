import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface IConfigurationEntity {
  IsUpdate:boolean;
  UpdateIntervalInHours:number;
  DebugMode:boolean;
}
