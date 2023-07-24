import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import SSHConfig from 'ssh2-promise/lib/sshConfig';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IoT } from '../Types/Enums';
import AccountAssignment = IoT.Enums.AccountAssignment;

export interface ISbcAccount {
  UserName: string;
  Groups: Array<string>;
  Assignment: AccountAssignment;
  SshKeyTypeBits: string;
  SshKeyFileName: string;
  /** .returnObject - the path to the file. Error - if the file does not exist */
  SshKeyPath: IotResult;
  ToSshConfig(): SSHConfig;
  ToJSON():any;
  FromJSON(obj:any):any;
}
