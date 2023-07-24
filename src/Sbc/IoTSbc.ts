import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { EntityBase } from '../Entity/EntityBase';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { ISbcAccount } from './ISbcAccount';
import { IoTHelper } from '../Helper/IoTHelper';
import { launchHelper } from '../Helper/launchHelper';
import { dotnetHelper } from '../Helper/dotnetHelper';
import { IotDevice } from '../IotDevice';
import { IConfiguration } from '../Configuration/IConfiguration';
import { FilesValidator } from '../Validator/FilesValidator';

import { SbcAccountType } from '../Types/SbcAccountType';
import { IoT } from '../Types/Enums';
import AccountAssignment = IoT.Enums.AccountAssignment;
import Existences = IoT.Enums.Existences;
import { ISbc } from './ISbc';
import SSHConfig from 'ssh2-promise/lib/sshConfig';
import { AddSBCConfigType } from '../Types/AddSBCConfigType';
import {networkHelper} from '../Helper/networkHelper';
import { SshClient } from '../Shared/SshClient';
import { AppDomain } from '../AppDomain';
import { SbcType } from '../Types/SbcType';

export class IoTSbc implements ISbc {
  private _id:string;
  public get Id(): string {
    return this._id;}
  private _label:string;
  public get  Label(): string {
    return this._label;}
  private _host:string;
  public get Host(): string {
    return this._host;}
  private _port:number;
  public get Port(): number {
    return this._port;}
  private _Existence:Existences;
  public get Existence(): Existences {
    return this._Existence;}
  //Info about Board and OS
  private _hostName:string;
  public get HostName(): string {
    return this._hostName;}
  private _boardName:string;
  public get BoardName(): string {
    return this._boardName;}
  private _architecture:string;
  public get Architecture(): string {
    return this._architecture;}
  private _osKernel:string;
  public get OsKernel(): string {
    return this._osKernel;}
  private _osName:string;
  public get OsName(): string {
    return this._osName;}
  private _osDescription:string;
  public get OsDescription(): string {
    return this._osDescription;}
  private _osRelease:string;
  public get OsRelease(): string {
    return this._osRelease;}
  private _osCodename:string;
  public get OsCodename(): string {
    return this._osCodename;}
  // Parts
  private _accounts:ISbcAccount[];
  public get Accounts(): ISbcAccount[] {
    return this._accounts;}
  
  constructor() {
		this._id = IoTHelper.CreateGuid();
    this._label = "None";
    this._host = "None";
    this._port = 0;
    this._Existence = Existences.none;
    //info
    this._hostName = "None";
    this._boardName = "Embedded device";
    this._architecture = "None";
    this._osKernel = "None";
    this._osName = "None";
    this._osDescription = "None";
    this._osRelease = "None";
    this._osCodename = "None";
    // Parts
    this._accounts = [];
  }

  public GetAccount(assignment: AccountAssignment): ISbcAccount| undefined {
    const result = this._accounts.find(item => item.Assignment === assignment);
    return result;
  }
 
  public Create(addSBCConfigType:AddSBCConfigType):Promise<IotResult> {

    throw new Error("This is an example exception.");

  }

  public async ConnectionTestLoginPass(host:string, port:number,  userName:string, password:string): Promise<IotResult> {
    let result:IotResult;
    //Get sshconfig
    const sshconfig:SSHConfig = {
      host: host,
      port: port,
      username: userName,
      password: password,
      tryKeyboard: true,
      readyTimeout: 7000
    };
    result = await this.ConnectionTest(sshconfig);
    return Promise.resolve(result);
  }

  public async ConnectionTestSshKey(sshconfig: SSHConfig, withSshConnectionTest:boolean=true): Promise<IotResult> {
    let result:IotResult;
    //Get sshconfig
    result = await this.ConnectionTest(sshconfig,withSshConnectionTest);
    return Promise.resolve(result);
  }

  private async ConnectionTest(sshconfig:SSHConfig, withSshConnectionTest:boolean=true): Promise<IotResult> {
    let result:IotResult;
    //Trubleshooting text
    const trubleshootingText=
      `To solve the problem, visit the Trubleshooting page:\n`+
      `https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/blob/master/docs/Troubleshooting.md\n`+
      `If you can't resolve the issue, you can create an Issue on GitHub:\n`+
      `https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/issues`;
      //GetIp
    result=await networkHelper.GetIpAddress(sshconfig.host ?? "non");
    if(result.Status==StatusResult.Error) {
      result.AddMessage(
        `Checklist:\n`+
        `❌ IP-Address defined;\n`+
        `❌ Host availability. Command: "ping";\n`+
        `❌ Port ${sshconfig.port} availability;\n`+
        `❌ Authorization via ssh protocol.\n`+
        `${trubleshootingText}`);
      return Promise.resolve(result);}
    const ipAddress = <string>result.returnObject;
    //Ping
    result=await networkHelper.PingHost(ipAddress);
    if(result.Status==StatusResult.Error) {
      result.AddMessage(
        `Checklist:\n`+
        `✔️ IP-Address defined;\n`+
        `❌ Host availability. Command: "ping";\n`+
        `❌ Port ${sshconfig.port} availability;\n`+
        `❌ Authorization via ssh protocol.\n`+
        `${trubleshootingText}`);
      return Promise.resolve(result);}
    //Check port
    result=await networkHelper.CheckTcpPortUsed(ipAddress,sshconfig.port ?? 22);
    if(result.Status==StatusResult.Error) {
      result.AddMessage(
        `Checklist:\n`+
        `✔️ IP-Address defined;\n`+
        `✔️ Host availability. Command: "ping";\n`+
        `❌ Port ${sshconfig.port} availability;\n`+
        `❌ Authorization via ssh protocol.\n`+
        `${trubleshootingText}`);
      return Promise.resolve(result);}
    if(!withSshConnectionTest) {
      result = new IotResult(StatusResult.Ok);
      //OK
      result.AddMessage(
        `Checklist:\n`+
        `✔️ IP-Address defined;\n`+
        `✔️ Host availability. Command: "ping";\n`+
        `✔️ Port ${sshconfig.port} availability.`);
      return Promise.resolve(result);
    }
    //Check ssh connection
    let sshClient = new SshClient();
    result = await sshClient.Connect(sshconfig);
    await sshClient.Close();
    await sshClient.Dispose();
    if(result.Status==StatusResult.Error) {
      //Error
      result.AddMessage(
        `Checklist:\n`+
        `✔️ IP-Address defined;\n`+
        `✔️ Host availability. Command: "ping";\n`+
        `✔️ Port ${sshconfig.port} availability;\n`+
        `❌ Authorization via ssh protocol.\n`+
        `${trubleshootingText}.\n`+
        `${result.toString()}`);
    } else {
      //OK
      result.AddMessage(
        `Checklist:\n`+
        `✔️ IP-Address defined;\n`+
        `✔️ Host availability. Command: "ping";\n`+
        `✔️ Port ${sshconfig.port} availability;\n`+
        `✔️ Authorization via ssh protocol.`);
    }
    return Promise.resolve(result);
  }

  private async RunScriptAsManagementAccount(fileNameScript:string): Promise<IotResult> {
    let result:IotResult;
    //Ping
    const AccountAssignmentType=AccountAssignment.management;
    const account = this.GetAccount(AccountAssignmentType);
    if(!account) {
      result=new IotResult(StatusResult.Error, `No account type ${this.GetNameAccountAssignmentByType(AccountAssignmentType)} to perform action: ${fileNameScript}.`);
      return Promise.resolve(result);
    }
    result=await this.ConnectionTestSshKey(account.ToSshConfig(),false);
    if(result.Status!=StatusResult.Ok) return Promise.resolve(result);
    //Ssh connection
    const app = AppDomain.getInstance().CurrentApp;
    let sshClient = new SshClient(app.Config.Folder.BashScripts);
    result = await sshClient.Connect(account.ToSshConfig());
    if(result.Status!=StatusResult.Ok) {
      await sshClient.Close();
      await sshClient.Dispose();
      return Promise.resolve(result);
    }
    //run script
    result=await sshClient.RunScript(fileNameScript,undefined,true);
    await sshClient.Close();
    await sshClient.Dispose();
    return Promise.resolve(result);
  }

  public async Reboot(): Promise<IotResult> {
    let result:IotResult;
    result = await this.RunScriptAsManagementAccount("reboot");
    return Promise.resolve(result);
  }

  public async Shutdown(): Promise<IotResult> {
    let result:IotResult;
    result = await this.RunScriptAsManagementAccount("shutdown");
    return Promise.resolve(result);
  }

  public Rename(newLabel:string): IotResult {
    let result:IotResult;
    newLabel = IoTHelper.StringTrim(newLabel);
    if(newLabel!="") {
      //ok
      result = new IotResult(StatusResult.Ok);
    }else {
      //not
      result = new IotResult(StatusResult.Error);
    }
    return result;
  }

  public ToJSON():SbcType {

    throw new Error("This is an example exception.");

  }

  public FromJSON(obj:SbcType) {

    throw new Error("This is an example exception.");

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
