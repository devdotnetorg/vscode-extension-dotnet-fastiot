import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IoT } from '../Types/Enums';
import LogLevel = IoT.Enums.LogLevel;
import Dialog = IoT.Enums.Dialog;

export interface IConfigurationExtension {
  readonly Version: string;
  PreviousVersion: string;
  readonly Mode: vscode.ExtensionMode;
  readonly Loglevel:LogLevel;
  Subscriptions: { dispose(): any }[];
}
