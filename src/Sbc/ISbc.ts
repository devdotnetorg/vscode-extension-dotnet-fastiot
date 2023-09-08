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
import { IoTSbcDTOCollection } from './IoTSbcDTOCollection';
import { SbcDtoType } from '../Types/SbcDtoType';
import { ClassWithEvent,Handler,IChangedStateEvent } from '../Shared/ClassWithEvent';

export interface ISbc extends ClassWithEvent {
  readonly Id: string;
  readonly Label: string;
  readonly Host: string;
  readonly Port: number;
  readonly Existence: Existence;
  //Info
  //apt-get install lsb-release
  readonly HostName: string; //$uname -n = bananapim64
  readonly BoardName: string; //BOARD_NAME="Banana Pi M64" from cat /etc/armbian-release
  readonly Architecture: string; //$uname -m = aarch64
  readonly OsKernel: string; //$uname -r = 5.10.34-sunxi64
  readonly OsName:string; //$lsb_release -i = Distributor ID: Ubuntu
  readonly OsDescription: string; //$lsb_release -d = Description: Ubuntu 18.04.5 LTS
  readonly OsRelease: string; //$lsb_release -r = Release: 18.04
  readonly OsCodename: string; //$lsb_release c = Codename: bionic
  // Parts
  Accounts: ISbcAccount[];
  Armbian: IotSbcArmbian;
  DTOs: IoTSbcDTOCollection<SbcDtoType>;
  //
  GetAccount(assignment: AccountAssignment): ISbcAccount| undefined;
  //
  Create(addSBCConfigType:AddSBCConfigType,token?:vscode.CancellationToken, forceMode?:boolean):Promise<IotResult>;
  Reboot(token?:vscode.CancellationToken): Promise<IotResult>;
  Shutdown(token?:vscode.CancellationToken): Promise<IotResult>;
  SetLabel(newLabel:string): IotResult;
  SetUniqueLabelCallback(
    getUniqueLabelCallback: (newlabel:string,suffix:string) => string
    ):void;
  ToJSON():SbcType;
  FromJSON(obj:SbcType):void;
  /**
   * Dispose
   */
  Dispose():void;
  ParseGetInfo(data:string):IotResult;
  ParseGetBoardName(data:string):IotResult;
  ParseGetInfoArmbian(data:string):IotResult;
  ParseGetSshKeyOfAccount(data:string,obj?:any):IotResult;
}
