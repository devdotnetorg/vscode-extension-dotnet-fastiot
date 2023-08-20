import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { ISbcAccount } from './ISbcAccount';
import { IoT } from '../Types/Enums';
import LogLevel = IoT.Enums.LogLevel;
import Existence = IoT.Enums.Existence;
import AccountAssignment = IoT.Enums.AccountAssignment;
import { AddSBCConfigType } from '../Types/AddSBCConfigType';
import { SbcType } from '../Types/SbcType';
import SSHConfig from 'ssh2-promise/lib/sshConfig';
import { IotSbcArmbian } from './IotSbcArmbian';
import { ClassWithEvent,Handler,IChangedStateEvent } from '../Shared/ClassWithEvent';

export interface ISbc {
  Id: string;
  Label: string;
  Host: string;
  Port: number;
  Existence: Existence;
  //Info
  //apt-get install lsb-release
  HostName: string; //$uname -n = bananapim64
  BoardName: string; //BOARD_NAME="Banana Pi M64" from cat /etc/armbian-release
  Architecture: string; //$uname -m = aarch64
  OsKernel: string; //$uname -r = 5.10.34-sunxi64
  OsName:string; //$lsb_release -i = Distributor ID: Ubuntu
  OsDescription: string; //$lsb_release -d = Description: Ubuntu 18.04.5 LTS
  OsRelease: string; //$lsb_release -r = Release: 18.04
  OsCodename: string; //$lsb_release c = Codename: bionic
  // Parts
  Accounts: ISbcAccount[];
  Armbian: IotSbcArmbian;
  //
  GetAccount(assignment: AccountAssignment): ISbcAccount| undefined;
  //
  Create(addSBCConfigType:AddSBCConfigType,token?:vscode.CancellationToken, forceMode?:boolean):Promise<IotResult>;
  Reboot(): Promise<IotResult>;
  Shutdown(): Promise<IotResult>;
  Rename(newLabel:string): IotResult;

  ToJSON():SbcType;
  FromJSON(obj:SbcType):void;
  
  ParseGetInfo(data:string):IotResult;
  ParseGetBoardName(data:string):IotResult;
  ParseGetInfoArmbian(data:string):IotResult;
  ParseGetSshKeyOfAccount(data:string,obj?:any):IotResult;
  
  //ClassWithEvent
  OnChangedStateSubscribe(handler: Handler<IChangedStateEvent>):Handler<IChangedStateEvent>;
  OnChangedStateUnsubscribe(handler: Handler<IChangedStateEvent>):void;
}
