import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IoT } from '../Types/Enums';
import Existence = IoT.Enums.Existence;
import AccountAssignment = IoT.Enums.AccountAssignment;
import { AddSBCConfigType } from '../Types/AddSBCConfigType';
import { SbcType } from '../Types/SbcType';
import SSHConfig from 'ssh2-promise/lib/sshConfig';

export interface ISshConnection {
  Host: string;
  Port: number;
  UserName: string;
  Password?: string;
  SshKeystorePath?: string;
  SshKeyFileName?: string;
  fromLoginPass(host:string, port:number,
    userName:string, password:string): void;
  fromLoginSshKey(host:string, port:number,
    userName:string,
    sshKeystorePath:string, sshKeyFileName:string): void;
  GetSshKeyPath():string| undefined;
  /** OK - file exists, No - if the file does not exist, Error - no data */
  IsExistsSshKey():IotResult;
  ToSshConfig(force?:boolean):SSHConfig;
  ConnectionTest(withSshConnectionTest:boolean): Promise<IotResult>;
}
