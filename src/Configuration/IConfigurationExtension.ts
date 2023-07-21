import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { EntityEnum } from '../Entity/EntityEnum';
import { IoT } from '../Types/Enums';
import LogLevel = IoT.Enums.LogLevel;
import Dialog = IoT.Enums.Dialog;

export interface IConfigurationExtension {
  Version: string;
  PreviousVersion: string;
  Mode: vscode.ExtensionMode;
  Loglevel:LogLevel;
  Subscriptions: { dispose(): any }[];
}
