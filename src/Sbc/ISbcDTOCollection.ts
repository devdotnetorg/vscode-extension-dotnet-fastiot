import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import SSHConfig from 'ssh2-promise/lib/sshConfig';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IoT } from '../Types/Enums';
import AccountAssignment = IoT.Enums.AccountAssignment;
import { VscodeLabel } from '@bendera/vscode-webview-elements';
import { SbcAccountType } from '../Types/SbcAccountType';
import { SbcDtoType } from '../Types/SbcDtoType';
import { ISshConnection } from '../Shared/ISshConnection';
import { SshConnection } from '../Shared/SshConnection';
import { ClassWithEvent } from '../Shared/ClassWithEvent';

export interface ISbcDTOCollection<SbcDtoType> extends ClassWithEvent {
  Load(token?:vscode.CancellationToken): Promise<IotResult>;
  Put(fileName:string, fileData:string, fileType:string,token?:vscode.CancellationToken):Promise<IotResult>;
  Delete(dto:SbcDtoType,token?:vscode.CancellationToken):Promise<IotResult>;
  Enable(dto:SbcDtoType,token?:vscode.CancellationToken):Promise<IotResult>;
  Disable(dto:SbcDtoType,token?:vscode.CancellationToken):Promise<IotResult>;
  ToJSON():SbcDtoType[];
  FromJSON(objs:SbcDtoType[]):void;
}
