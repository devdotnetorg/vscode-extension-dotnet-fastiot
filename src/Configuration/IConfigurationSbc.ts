import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IoT } from '../Types/Enums';
import EntityEnum = IoT.Enums.Entity;
import { IotResult,StatusResult } from '../Shared/IotResult';
import { SbcType } from '../Types/SbcType';

export interface IConfigurationSbc {
  readonly DebugUserNameAccount:string;
  readonly DebugGroupsAccount:string[];
  readonly ManagementUserNameAccount:string;
  readonly ManagementGroupsAccount:string[];
  readonly SshKeyType:string;
  readonly SshKeyBits:number;
  readonly DebugAppFolder:string;
  readonly FileNameUdevRules:string;
  readonly ListFilesUdevRules:string[];
  PreviousHostWhenAdding: string;
  /** obj.sbcs: SbcType[],
   * return string
  */
  ProfilesSBCJson: string;
  GetFileUdevRules(fileName:string, isTest?:boolean): IotResult;
}
