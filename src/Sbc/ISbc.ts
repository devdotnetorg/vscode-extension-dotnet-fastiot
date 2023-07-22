import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { ISbcAccount } from './ISbcAccount';
import { IoT } from '../Types/Enums';
import Existences = IoT.Enums.Existences;
import AccountAssignment = IoT.Enums.AccountAssignment;
import { AddSBCConfigType } from '../Types/AddSBCConfigType';

export interface ISbc {
  Id: string;
  Label: string;
  Host: string;
  Port: number;
  Existence: Existences;
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
  //
  GetAccount(assignment: AccountAssignment): ISbcAccount| undefined;
  //
  Create(addSBCConfigType:AddSBCConfigType):IotResult;
  ConnectionTest(host?:string, port?:number, password?:string, account?: ISbcAccount): IotResult;
  Reboot(): IotResult;
  Shutdown(): IotResult;
  Rename(newLabel:string): IotResult;
     
  ToJSON():any;
  FromJSON(obj:any):any;
}
