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

export class IoTSbcAccount implements ISbcAccount {
  private _host:string;
  private _port:number;
  private _keysSbcPath:string;

  private _userName:string;
  public get UserName(): string {
    return this._userName;}
  private _groups:Array<string>;
  public get Groups():Array<string> {
    return this._groups;}
  private _assignment:AccountAssignment;
  public get Assignment(): AccountAssignment {
    return this._assignment;}
  private _sshKeyTypeBits:string;
  public get SshKeyTypeBits(): string {
    return this._sshKeyTypeBits;}
  private _sshKeyFileName:string;
  public get SshKeyFileName(): string {
    return this._sshKeyFileName;}
  public get SshKeyPath(): IotResult {
    return this.GetSshKeyPath();}

  constructor(host:string, port:number,keysSbcPath:string) {
    this._host = host;
    this._port = port;
    this._keysSbcPath = keysSbcPath;
    this._userName = "None";
    this._groups = [];
    this._assignment = AccountAssignment.none;
    this._sshKeyTypeBits = "None";
    this._sshKeyFileName = "None";
  }

  private GetSshKeyPath():IotResult {
    let result:IotResult;
    const sshKeyPath = path.join(this._keysSbcPath, this._sshKeyFileName);
    if (fs.existsSync(sshKeyPath)) {
      //ok
      result = new IotResult(StatusResult.Ok);
    }else {
      //not exists
      result = new IotResult(StatusResult.Error,`${sshKeyPath} SSH key file does not exist.`);
    }
    result.returnObject=sshKeyPath;
    return result;
  }

  public ToSshConfig():IotResult {
    let result:IotResult;
    result = this.SshKeyPath;
    if(result.Status==StatusResult.Ok) {
      //ok
      const identity = <string>result.returnObject;
      result = new IotResult(StatusResult.Ok);
      const sshconfig:SSHConfig  = {
        host: this._host,
        port: this._port,
        username: this.UserName,
        identity: identity,
        readyTimeout: 7000
      };
      result.returnObject=sshconfig;
    }
    return result;
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
      const assignmentStr = this.GetNameAccountAssignmentByType(this.Assignment) ?? AccountAssignment.none;
      //Fill
      obj = {
        username:this.UserName,
        groups:groupsAccount,
        assignment:assignmentStr,
        sshkeytypebits: this.SshKeyTypeBits,
        sshkeyfileName: this.SshKeyFileName
      };
  } catch (err: any){}
    //result
    return obj;
  }

  public FromJSON(obj:SbcAccountType) {
    try {
      const groupsAccount = IoTHelper.StringToArray(obj.groups,',');
      const assignment = this.GetAccountAssignmentByName(obj.assignment);
      //get
      this._userName=obj.username;
      this._groups=groupsAccount;
      this._assignment=assignment;
      this._sshKeyTypeBits=obj.sshkeytypebits;
      this._sshKeyFileName=obj.sshkeyfileName;
    } catch (err: any){}
  }

  private GetNameAccountAssignmentByType(value:AccountAssignment):string| undefined
  {
    //get name
    let result = Object.keys(AccountAssignment)[Object.values(AccountAssignment).indexOf(value)];
    return result;
  }

  private GetAccountAssignmentByName(value:string):AccountAssignment
  {
    //get type
    const result = Object.values(AccountAssignment)[Object.keys(AccountAssignment).indexOf(value)];
    return  <AccountAssignment>result;
  }

}
