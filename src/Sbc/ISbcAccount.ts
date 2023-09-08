import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import SSHConfig from 'ssh2-promise/lib/sshConfig';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IoT } from '../Types/Enums';
import AccountAssignment = IoT.Enums.AccountAssignment;
import { VscodeLabel } from '@bendera/vscode-webview-elements';
import { SbcAccountType } from '../Types/SbcAccountType';
import { ISshConnection } from '../Shared/ISshConnection';
import { SshConnection } from '../Shared/SshConnection';

export interface ISbcAccount extends ISshConnection {
  readonly Groups: Array<string>;
  readonly Assignment: AccountAssignment;
  readonly SshKeyTypeBits: string;
  fromLoginSshKey(host:string, port:number,
    userName:string, sshKeystorePath:string, sshKeyFileName:string,
    groups?:Array<string>,sshKeyTypeBits?:string,assignment?:AccountAssignment
    ): void;
  ToJSON():SbcAccountType;
  FromJSON(obj:SbcAccountType):void;
}
