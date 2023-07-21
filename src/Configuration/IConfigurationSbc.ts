import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { EntityEnum } from '../Entity/EntityEnum';
import { IoT } from '../Types/Enums';
import LogLevel = IoT.Enums.LogLevel;
import Dialog = IoT.Enums.Dialog;
import { IotResult,StatusResult } from '../Shared/IotResult';

export interface IConfigurationSbc {
  DebugUserNameAccount:string;
  DebugGroupsAccount:string[];
  ManagementUserNameAccount:string;
  ManagementGroupsAccount:string[];
  SshKeyType:string;
  SshKeyBits:number;
  DebugAppFolder:string;
  FileNameUdevRules:string;
  ListFilesUdevRules:string[];
  PreviousHostnameWhenAdding: string;
  ProfilesSBCJson:any;
  GetFileUdevRules(fileName:string, isTest?:boolean): IotResult;
}
