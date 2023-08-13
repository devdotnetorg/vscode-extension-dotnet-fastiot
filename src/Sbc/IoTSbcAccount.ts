import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { EntityBase } from '../Entity/EntityBase';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IoTHelper } from '../Helper/IoTHelper';
import { launchHelper } from '../Helper/launchHelper';
import { dotnetHelper } from '../Helper/dotnetHelper';
import { IotDevice } from '../IotDevice';
import { IConfiguration } from '../Configuration/IConfiguration';
import { FilesValidator } from '../Validator/FilesValidator';

import { SbcAccountType } from '../Types/SbcAccountType';
import { IoT } from '../Types/Enums';
import AccountAssignment = IoT.Enums.AccountAssignment;
import { ISbcAccount } from './ISbcAccount';
import SSHConfig from 'ssh2-promise/lib/sshConfig';
import { enumHelper } from '../Helper/enumHelper';

import { SshConnection } from '../Shared/SshConnection';

export class IoTSbcAccount extends SshConnection implements ISbcAccount {
  private _groups:Array<string>;
  public get Groups():Array<string> {
    return this._groups;}
  private _assignment:AccountAssignment;
  public get Assignment(): AccountAssignment {
    return this._assignment;}
  private _sshKeyTypeBits:string;
  public get SshKeyTypeBits(): string {
    return this._sshKeyTypeBits;}

  constructor(host:string, port:number,sshKeystorePath:string) {
    super();
    super.fromLoginSshKey(host,port,"None",sshKeystorePath,"None");
    this._groups = [];
    this._assignment = AccountAssignment.none;
    this._sshKeyTypeBits = "None";
  }

  public fromLoginSshKey(host:string, port:number,
    userName:string,
    sshKeystorePath:string, sshKeyFileName:string,assignment?:AccountAssignment) {
    this.Init(host,port,userName,undefined,sshKeystorePath,sshKeyFileName);
    this._assignment=assignment ?? AccountAssignment.none;
  }

  public ToJSON():SbcAccountType {
    //blank
    let obj:SbcAccountType = {
      username: "None",
      groups: "None",
      assignment: "None",
      sshkeytypebits: "None",
      sshkeyfileName: "None"
    };
    try {
      const groupsAccount = IoTHelper.ArrayToString(this.Groups,',');
      const assignmentStr = enumHelper.GetNameAccountAssignmentByType(this.Assignment) ?? AccountAssignment.none;
      //Fill
      obj = {
        username:this.UserName,
        groups:groupsAccount,
        assignment:assignmentStr,
        sshkeytypebits: this.SshKeyTypeBits,
        sshkeyfileName: this.SshKeyFileName?? "None"
      };
  } catch (err: any){}
    //result
    return obj;
  }

  public FromJSON(obj:SbcAccountType) {
    try {
      const groupsAccount = IoTHelper.StringToArray(obj.groups,',');
      const assignment = enumHelper.GetAccountAssignmentByName(obj.assignment);
      //get
      const userName= obj.username;
      const sshkeyfileName= obj.sshkeyfileName;
      this.fromLoginSshKey(
        this.Host,this.Port,userName,
        this.SshKeystorePath ?? "None",sshkeyfileName,
        assignment);
      //
      this._groups=groupsAccount;
      this._sshKeyTypeBits=obj.sshkeytypebits;
    } catch (err: any){}
  }

}
