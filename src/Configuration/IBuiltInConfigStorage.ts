import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface IBuiltInConfigStorage {
  PreviousVerExt: string;
  LastUpdateTimeTemplatesInHours:number;
  PreviousHostnameSbcWhenAdding:string;
}
