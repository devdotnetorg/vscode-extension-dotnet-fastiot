import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { EntityBase } from '../Entity/EntityBase';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IoTHelper } from '../Helper/IoTHelper';
import { launchHelper } from '../Helper/launchHelper';
import { dotnetHelper } from '../Helper/dotnetHelper';
import { IConfiguration } from '../Configuration/IConfiguration';
import { FilesValidator } from '../Validator/FilesValidator';
import { networkHelper } from '../Helper/networkHelper';
import { SshClient } from '../Shared/SshClient';

import { SbcAccountType } from '../Types/SbcAccountType';
import { IoT } from '../Types/Enums';
import AccountAssignment = IoT.Enums.AccountAssignment;
import SSHConfig from 'ssh2-promise/lib/sshConfig';
import { ISshConnection } from './ISshConnection';

export class SshConnection implements ISshConnection {
  private _host:string;
  public get Host(): string {
    return this._host;}
  private _port:number;
  public get Port(): number {
    return this._port;}
  private _userName:string;
  public get UserName(): string {
    return this._userName;}
  private _password?:string;
  public get Password(): string| undefined {
    return this._password;}
  private _sshKeystorePath?:string;
  public get SshKeystorePath(): string| undefined {
    return this._sshKeystorePath;}
  private _sshKeyFileName?:string;
  public get SshKeyFileName(): string| undefined {
    return this._sshKeyFileName;}

  public constructor() {
    this._host="None";
    this._port=0;
    this._userName="None";
    this._password="None";
    this._sshKeystorePath="None";
    this._sshKeyFileName="None";     
  }

  protected Init(host:string, port:number,
    userName:string, password?:string,
    sshKeystorePath?:string, sshKeyFileName?:string) {
    this._host=host;
    this._port=port;
    this._userName=userName;
    this._password=password;
    this._sshKeystorePath=sshKeystorePath;
    this._sshKeyFileName=sshKeyFileName;     
  }

  public fromLoginPass(host:string, port:number,
    userName:string, password:string) {
    this.Init(host,port,userName,password);
  }

  public fromLoginSshKey(host:string, port:number,
    userName:string,
    sshKeystorePath:string, sshKeyFileName:string) {
    this.Init(host,port,userName,undefined,sshKeystorePath,sshKeyFileName);
  }

  public GetSshKeyPath():string| undefined {
    let sshKeyPath:string| undefined;
    if(this._sshKeystorePath && this._sshKeyFileName) {
      sshKeyPath = path.join(this._sshKeystorePath, this._sshKeyFileName);
    }
    return sshKeyPath;
  }

  public IsExistsSshKey():IotResult {
    let result:IotResult;
    const sshKeyPath = this.GetSshKeyPath();
    if(!sshKeyPath)
      result = new IotResult(StatusResult.Error,`Properties not set: ssh key storage path, ssh key file name`);
    if (sshKeyPath && fs.existsSync(sshKeyPath)) {
      //ok
      result = new IotResult(StatusResult.Ok);
    }else {
      //not exists
      result = new IotResult(StatusResult.No,`SSH key file not found: ${sshKeyPath}`);
    }
    result.returnObject=sshKeyPath;
    return result;
  }

  public ToSshConfig(forceMode?:boolean):SSHConfig {
    //shared
    let sshconfig:SSHConfig = {
      host: this._host,
      port: this._port,
      username: this._userName,
      //
      readyTimeout: 7000
    };
    //force
    if(forceMode) {
      sshconfig.readyTimeout=99999;
      sshconfig.reconnectTries=3;
      sshconfig.timeout=99999;
      sshconfig.keepaliveInterval=200000;
      sshconfig.keepaliveCountMax=5;
    }
    //Login and pass
    if(this._password) {
      sshconfig.password=this._password;
      sshconfig.tryKeyboard=true;
    };
    //Sshkey
    if(this._sshKeyFileName) {
      const identity = this.GetSshKeyPath();
      sshconfig.identity = identity;
    };
    //result
    return sshconfig;
  }

  public async ConnectionTest(withSshConnectionTest:boolean=true): Promise<IotResult> {
    let result:IotResult;
    const sshconfig = this.ToSshConfig();
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
        `${trubleshootingText}`);
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

}
