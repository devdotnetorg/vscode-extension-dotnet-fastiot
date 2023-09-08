import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface IConfigurationEntity {
  readonly IsUpdate:boolean;
  readonly UpdateIntervalInHours:number;
  readonly DebugMode:boolean;
}
