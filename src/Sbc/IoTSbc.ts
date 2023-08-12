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
import Existence = IoT.Enums.Existence;
import { ISbc } from './ISbc';
import SSHConfig from 'ssh2-promise/lib/sshConfig';
import { AddSBCConfigType } from '../Types/AddSBCConfigType';
import { networkHelper } from '../Helper/networkHelper';
import { SshClient } from '../Shared/SshClient';
import { ISshConnection } from '../Shared/ISshConnection';
import { SshConnection } from '../Shared/SshConnection';
import { AppDomain } from '../AppDomain';
import { SbcType } from '../Types/SbcType';
import { ClassWithEvent } from '../Shared/ClassWithEvent';
import { TaskQueue } from '../Shared/TaskQueue';
import { TaskRunScript } from '../Shared/TaskRunScript';
import { TaskPutFile } from '../Shared/TaskPutFile';
import { ArgumentsCommandCli } from '../Shared/ArgumentsCommandCli';
import { IotSbcArmbian } from './IotSbcArmbian';
import { IoTSbcAccount } from './IoTSbcAccount';
import { enumHelper } from '../Helper/enumHelper';
import { Constants } from "../Constants"

export class IoTSbc extends ClassWithEvent implements ISbc {
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
  private _existence:Existence;
  public get Existence(): Existence {
    return this._existence;}
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
  private _armbian:IotSbcArmbian
  public get Armbian(): IotSbcArmbian {
    return this._armbian;}

  //Format Version JSON
  private readonly _formatVersion = 2;

  constructor() {
    super();
		this._id = IoTHelper.CreateGuid();
    this._label = "None";
    this._host = "None";
    this._port = 0;
    this._existence = Existence.none;
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
    this._armbian = new IotSbcArmbian();
  }

  public GetAccount(assignment: AccountAssignment): ISbcAccount| undefined {
    const result = this._accounts.find(item => item.Assignment === assignment);
    return result;
  }
 
  public async Create(addSBCConfig:AddSBCConfigType,token?:vscode.CancellationToken,forceMode?:boolean):Promise<IotResult> {
    /*******************************
    Script run order:
      1) 1_pregetinfo.sh
      force: 1_pregetinfo_force.sh
      2) 2_getinfo.sh
      3) 3_getinfoboardname.sh
      force: if it fails, then pass
      4) 4_getinfoarmbian.sh
      force: if it fails, then pass
      5) 5_createaccount.sh
      6) 6_getsshkeyofaccount.sh
      7) 7_addusertogroups.sh
      8) 8_changeconfigssh.sh
      force: if it fails, then pass
      9) 9_applyudevrules.sh
      force: if it fails, then pass
     *******************************/
    //
    let result:IotResult;
    const app = AppDomain.getInstance().CurrentApp;
    //Connection
    let sshConnection:ISshConnection = new SshConnection();
    sshConnection.fromLoginPass(
      addSBCConfig.host, addSBCConfig.port,
      addSBCConfig.username, addSBCConfig.password ?? "None");
    //SshClient
    let sshClient = new SshClient(app.Config.Folder.BashScripts);
    //event subscription
    let handler=sshClient.OnChangedStateSubscribe(event => {
      //output
      if(event.message) {
          if(event.logLevel) app.UI.Output(event.message,event.logLevel);
              else app.UI.Output(event.message);
      }
    });
    result = await sshClient.Connect(sshConnection.ToSshConfig(forceMode),token);
    if(result.Status!=StatusResult.Ok) {
      //event unsubscription
      sshClient.OnChangedStateUnsubscribe(handler);
      return Promise.resolve(result);
    }
    //Tasks Queue
    let taskQueue:TaskQueue<TaskRunScript|TaskPutFile>;
    taskQueue = new TaskQueue<TaskRunScript|TaskPutFile>();
    taskQueue.SetCallbacks(this.CreateEvent,this.CreateEventProgress);
    let taskRunScript:TaskRunScript;
    let taskPutFile:TaskPutFile;
    let argumentsCommandCliNormal:ArgumentsCommandCli;
    //let argumentsCommandCliForce:ArgumentsCommandCli;
    // ********************************************************************
    // 1_pregetinfo.sh
    // force: 1_pregetinfo_force.sh
    taskRunScript = new TaskRunScript(
      "Installing utilities",
      "1_pregetinfo",undefined,
      "1_pregetinfo_force",undefined);
    taskQueue.push(taskRunScript);
    // ********************************************************************
    // 2_getinfo.sh
    taskRunScript = new TaskRunScript(
      "Getting data",
      "2_getinfo",undefined,
      undefined,undefined,
      this.ParseGetInfo);
    taskQueue.push(taskRunScript);
    // ********************************************************************
    // 3_getinfoboardname.sh
    // force: if it fails, then pass
    taskRunScript = new TaskRunScript(
      "Getting board name",
      "3_getinfoboardname",undefined,
      undefined,undefined,
      this.ParseGetBoardName,true);
    taskQueue.push(taskRunScript);
    // ********************************************************************
    // 4_getinfoarmbian.sh
    // force: if it fails, then pass
    taskRunScript = new TaskRunScript(
      "Getting information about Armbian",
      "4_getinfoarmbian",undefined,
      undefined,undefined,
      this.ParseGetInfoArmbian,true);
    taskQueue.push(taskRunScript);
    // ********************************************************************
    // 5_createaccount.sh
    // debugvscode
    argumentsCommandCliNormal = new ArgumentsCommandCli();
    argumentsCommandCliNormal.AddArgument("username",addSBCConfig.debugusername);
    taskRunScript = new TaskRunScript(
      `Create an account '${addSBCConfig.debugusername}'`,
      "5_createaccount",argumentsCommandCliNormal);
    taskQueue.push(taskRunScript);
    // ********************************************************************
    // 6_getsshkeyofaccount.sh
    // debugvscode
    // get file of debugvscode
    taskRunScript = new TaskRunScript(
      `Get ssh key of account '${addSBCConfig.debugusername}'`,
      "6_getsshkeyofaccount",argumentsCommandCliNormal,
      undefined,undefined,
      this.ParseGetSshKeyOfAccount);
    taskQueue.push(taskRunScript);
    // ********************************************************************
    // 5_createaccount.sh
    // managementvscode
    argumentsCommandCliNormal = new ArgumentsCommandCli();
    argumentsCommandCliNormal.AddArgument("username",addSBCConfig.managementusername);
    taskRunScript = new TaskRunScript(
      `Create an account '${addSBCConfig.managementusername}'`,
      "5_createaccount",argumentsCommandCliNormal,
      undefined,undefined,
      this.ParseGetSshKeyOfAccount);
    taskQueue.push(taskRunScript);
    // ********************************************************************
    // 6_getsshkeyofaccount.sh
    // managementvscode
    // get file of debugvscode
    taskRunScript = new TaskRunScript(
      `Get ssh key of account '${addSBCConfig.managementusername}'`,
      "6_getsshkeyofaccount",argumentsCommandCliNormal,
      undefined,undefined,
      this.ParseGetSshKeyOfAccount);
    taskQueue.push(taskRunScript);
    // ********************************************************************
    // 7_addusertogroups.sh
    // debugvscode
    argumentsCommandCliNormal = new ArgumentsCommandCli();
    argumentsCommandCliNormal.AddArgument("username",addSBCConfig.debugusername);
    argumentsCommandCliNormal.AddArgument("groups", IoTHelper.ArrayToString(addSBCConfig.debuggroups ?? [],','));
    argumentsCommandCliNormal.AddArgument("creategroup","yes");
    taskRunScript = new TaskRunScript(
      `Adding the user '${addSBCConfig.debugusername}' to the group(s) '${IoTHelper.ArrayToString(addSBCConfig.debuggroups ?? [],',')}'`,
      "6_addusertogroups",argumentsCommandCliNormal);
    taskQueue.push(taskRunScript);
    // ********************************************************************
    // 7_addusertogroups.sh
    // managementvscode
    argumentsCommandCliNormal = new ArgumentsCommandCli();
    argumentsCommandCliNormal.AddArgument("username",addSBCConfig.managementusername);
    argumentsCommandCliNormal.AddArgument("groups", IoTHelper.ArrayToString(addSBCConfig.managementgroups ?? [],','));
    taskRunScript = new TaskRunScript(
      `Adding the user '${addSBCConfig.managementusername}' to the group(s) '${IoTHelper.ArrayToString(addSBCConfig.managementgroups ?? [],',')}'`,
      "6_addusertogroups",argumentsCommandCliNormal);
    taskQueue.push(taskRunScript);
    // ********************************************************************
    // 8_changeconfigssh.sh
    // force: if it fails, then pass
    taskRunScript = new TaskRunScript(
      `Changing OpenSSH settings`,
      "8_changeconfigssh",undefined,
      undefined,undefined,
      undefined,true);
    taskQueue.push(taskRunScript);
    // ********************************************************************
    // Copying the udev rules file
    // put file 20-gpio-fastiot.rules in folder /etc/udev/rules.d
    const filenameudevrules = addSBCConfig.filenameudevrules;
    if(filenameudevrules!="None") {
      result = app.Config.Sbc.GetFileUdevRules(filenameudevrules);
      if(result.Status==StatusResult.Ok) {
        //event unsubscription
        const dataFile=<string>result.returnObject;
        const destFilePath=
          `${Constants.folderDestForFileUdevRules}/${filenameudevrules}`;
        taskPutFile = new TaskPutFile("Copying the udev rules file",
          destFilePath, dataFile);
        //
        taskQueue.push(taskPutFile);
      }else {
        this.CreateEvent(result);
      }
    }
    // ********************************************************************
    // 9_applyudevrules.sh
    // force: if it fails, then pass
    taskRunScript = new TaskRunScript(
      `Apply udev rules`,
      "9_applyudevrules",undefined,
      undefined,undefined,
      undefined,true);
    taskQueue.push(taskRunScript);
    // run taskQueue
    result = await taskQueue.Run(sshClient,token);
    //report
    result.AddMessage(taskQueue.GetReport());
    if(result.Status==StatusResult.Ok) {
      //TODO: check debugvscode ROOT == managementvscode ROOT


      result=new IotResult(StatusResult.Ok,`Single-board computer profile created`);
    }else {
      result.AddMessage("Single-board computer profile creation error");
    }
    //Dispose
    taskQueue.Dispose();
    //result
    //event unsubscription    
    sshClient.OnChangedStateUnsubscribe(handler);
    await sshClient.Close();
    await sshClient.Dispose();
    return Promise.resolve(result);
  }

  private async RunScriptAsManagementAccount(fileNameScript:string): Promise<IotResult> {
    let result:IotResult;
    //Ping
    const AccountAssignmentType=AccountAssignment.management;
    const account = this.GetAccount(AccountAssignmentType);
    if(!account) {
      result=new IotResult(StatusResult.Error, `No account type ${enumHelper.GetNameAccountAssignmentByType(AccountAssignmentType)} to perform action: ${fileNameScript}.`);
      return Promise.resolve(result);
    }
    result=await account.ConnectionTest(false);
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
    result=await sshClient.RunScript(fileNameScript, undefined, undefined, true);
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
    let accounts:SbcAccountType[] = [];
    //blank
    let obj:SbcType = {
      id: "None",
      label: "None",
      host: "None",
      port: 22,
      existence: "None",
      formatversion:0,
      //Info
      hostname: "None",
      boardname: "None",
      architecture: "None",
      oskernel: "None",
      osname:"None",
      osdescription: "None",
      osrelease: "None",
      oscodename: "None",
      // Parts
      accounts: accounts,
      armbian: new IotSbcArmbian().ToJSON()
    };
    try {
      const existence = enumHelper.GetNameExistenceByType(this.Existence) ?? "none";
      this.Accounts.forEach((item) => {
        let obj = item.ToJSON();
        accounts.push(obj);
      });
      const armbian = this.Armbian.ToJSON();
      //Fill
      obj = {
        id: this.Id,
        label: this.Label,
        host: this.Host,
        port: this.Port,
        existence: existence,
        formatversion:this._formatVersion,
        //Info
        hostname: this.HostName,
        boardname: this.BoardName,
        architecture: this.Architecture,
        oskernel: this.OsKernel,
        osname: this.OsName,
        osdescription: this.OsDescription,
        osrelease: this.OsRelease,
        oscodename: this.OsCodename,
        // Parts
        accounts: accounts,
        armbian: armbian
      };
    } catch (err: any){}
    //result
    return obj;
  }

  public FromJSON(obj:SbcType) {
    try {
      this._id = obj.id;
      this._label = obj.label;
      this._host = obj.host;
      this._port = obj.port;
      const existence = enumHelper.GetExistenceByName(obj.existence);
      this._existence = existence;
      //Info
      this._hostName = obj.hostname;
      this._boardName = obj.boardname;
      this._architecture = obj.architecture;
      this._osKernel = obj.oskernel;
      this._osName = obj.osname;
      this._osDescription = obj.osdescription;
      this._osRelease = obj.osrelease;
      this._osCodename = obj.oscodename;
      // Parts
      const app = AppDomain.getInstance().CurrentApp;
      //Accounts
      let account:ISbcAccount;
      obj.accounts.forEach((item) => {
        account = new IoTSbcAccount(this.Host,this.Port,app.Config.Folder.KeysSbc);
        account.FromJSON(item);
        this._accounts.push(account);
      });
      //Armbian
      this._armbian.FromJSON(obj.armbian);
    } catch (err: any){}
  }

  //************************ Parse ************************

  public ParseGetInfo(data:string,fileNameScript:string,argumentScript?: ArgumentsCommandCli):IotResult {
    let result:IotResult;
    result=new IotResult(StatusResult.Ok);
    try {
      throw new Error("This is an example exception.");
    } catch (err: any){
      result=new IotResult(StatusResult.Error,"Parse error, ParseGetInfo function",err);
    }
    //result
    return result;
  }

  public ParseGetBoardName(data:string,fileNameScript:string,argumentScript?: ArgumentsCommandCli):IotResult {
    let result:IotResult;
    result=new IotResult(StatusResult.Ok);
    try {
      throw new Error("This is an example exception.");
    } catch (err: any){
      result=new IotResult(StatusResult.Error,"Parse error, ParseGetBoardName function",err);
    }
    //result
    return result;
  }

  public ParseGetInfoArmbian(data:string,fileNameScript:string,argumentScript?: ArgumentsCommandCli):IotResult {
    let result:IotResult;
    result=new IotResult(StatusResult.Ok);
    try {
      throw new Error("This is an example exception.");
    } catch (err: any){
      result=new IotResult(StatusResult.Error,"Parse error, ParseGetInfoArmbian function",err);
    }
    //result
    return result;
  }

  public ParseGetSshKeyOfAccount(data:string,fileNameScript:string,argumentScript?: ArgumentsCommandCli):IotResult {
    let result:IotResult;
    result=new IotResult(StatusResult.Ok);
    try {
      throw new Error("This is an example exception.");
    } catch (err: any){
      result=new IotResult(StatusResult.Error,"Parse error, ParseGetSshKeyOfAccount function",err);
    }
    //result
    return result;
  }

}
