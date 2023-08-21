import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IoT } from '../Types/Enums';
import EntityEnum = IoT.Enums.Entity;
import { IotResult,StatusResult } from '../Shared/IotResult';
import { SbcType } from '../Types/SbcType';

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
  PreviousHostWhenAdding: string;
  /** obj.sbcs: SbcType[],
   * return string
  */
  ProfilesSBCJson: string;
  GetFileUdevRules(fileName:string, isTest?:boolean): IotResult;
}
