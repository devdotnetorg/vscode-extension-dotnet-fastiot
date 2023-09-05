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
import { ISbcDTOCollection } from './ISbcDTOCollection';
import { ISbcAccount } from './ISbcAccount';
import SSHConfig from 'ssh2-promise/lib/sshConfig';
import { enumHelper } from '../Helper/enumHelper';
import { SbcDtoType } from '../Types/SbcDtoType';
import { SshConnection } from '../Shared/SshConnection';
import { ClassWithEvent } from '../Shared/ClassWithEvent';
import { ISbc } from './ISbc';
import { IoTDTOAdapters } from "./IoTDTOAdapters"
import { SbcDtoAdapterType } from "../Types/SbcDtoAdapterType"

export class IoTSbcDTOCollection<SbcDtoType> extends ClassWithEvent implements ISbcDTOCollection<SbcDtoType> {
  private _items:Array<SbcDtoType>;
  private _adapter:SbcDtoAdapterType|undefined;
  
  constructor(
    adapter?:SbcDtoAdapterType
  ) {
    super();
    this._items = new Array<SbcDtoType>();
    //adapter
    this._adapter=adapter;
  }

  public async Load(token?:vscode.CancellationToken): Promise<IotResult> {
    if(!this._adapter)
      return Promise.resolve(new IotResult(StatusResult.Error,"There is no supported DTO adapter for this SBC"));
    //next

    throw new Error("This is an example exception.");
  
  }

  public async Put(fileName:string, fileData:string, fileType:string,token?:vscode.CancellationToken): Promise<IotResult> {

    throw new Error("This is an example exception.");
  
  }

  public async Delete(dto:SbcDtoType,token?:vscode.CancellationToken): Promise<IotResult> {

    throw new Error("This is an example exception.");
  
  }

  public async Enable(dto:SbcDtoType,token?:vscode.CancellationToken): Promise<IotResult> {

    throw new Error("This is an example exception.");
  
  }

  public async Disable(dto:SbcDtoType,token?:vscode.CancellationToken): Promise<IotResult> {

    throw new Error("This is an example exception.");
  
  }

  public ToJSON():SbcDtoType[] {

    throw new Error("This is an example exception.");

    /*
    //blank
    let obj:SbcAccountType = {
      username: "None",
      groups: "None",
      assignment: "None",
      sshkeytypebits: "None",
      sshkeyfilename: "None"
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
        sshkeyfilename: this.SshKeyFileName?? "None"
      };
  } catch (err: any){}
    //result
    return obj;
    */
  }

  public FromJSON(objs:SbcDtoType[]) {

    throw new Error("This is an example exception.");

    /*
    try {
      //get
      const userName= obj.username;
      const groupsAccount = IoTHelper.StringToArray(obj.groups,',');
      const assignment = enumHelper.GetAccountAssignmentByName(obj.assignment);
      const sshKeyTypeBits = obj.sshkeytypebits;
      const sshKeyFileName= obj.sshkeyfilename;
      //build
      this.fromLoginSshKey(
        this.Host,this.Port,
        userName, this.SshKeystorePath ?? "None",sshKeyFileName,
        groupsAccount,sshKeyTypeBits,assignment);
    } catch (err: any){}
    */
  }

}
