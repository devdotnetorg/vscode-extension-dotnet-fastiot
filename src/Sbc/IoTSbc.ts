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
import LogLevel = IoT.Enums.LogLevel;
import Contain = IoT.Enums.Contain;
import EntityEnum = IoT.Enums.Entity;
import ChangeCommand = IoT.Enums.ChangeCommand;
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
import { TaskGetFile } from '../Shared/TaskGetFile';
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
  public get Label(): string {
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
  private _hostName:string; //$uname -n = bananapim64
  public get HostName(): string {
    return this._hostName;}
  private _boardName:string; //BOARD_NAME="Banana Pi M64" from cat /etc/armbian-release
  public get BoardName(): string {
    return this._boardName;}
  private _architecture:string; //$uname -m = aarch64
  public get Architecture(): string {
    return this._architecture;}
  private _osKernel:string; //$uname -r = 5.10.34-sunxi64
  public get OsKernel(): string {
    return this._osKernel;}
  private _osName:string; //$lsb_release -i = Distributor ID: Ubuntu
  public get OsName(): string {
    return this._osName;}
  private _osDescription:string; //$lsb_release -d = Description: Ubuntu 18.04.5 LTS
  public get OsDescription(): string {
    return this._osDescription;}
  private _osRelease:string; //$lsb_release -r = Release: 18.04
  public get OsRelease(): string {
    return this._osRelease;}
  private _osCodename:string; //$lsb_release c = Codename: bionic
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

  private _getUniqueLabelCallback:((newlabel:string,suffix:string) => string)|undefined;
  
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
      3) 3_getboardname.sh
      force: if it fails, then pass
      4) 4_getinfoarmbian.sh
      force: if it fails, then pass
      5) 5_createaccount.sh
      6) get ssh key file of debugvscode and managementvscode
      7) 6_addusertogroups.sh
      8) 7_changeconfigssh.sh
      force: if it fails, then pass
      9) put file udev rules file in folder /etc/udev/rules.d
      force: if it fails, then pass
      10) 8_applyudevrules.sh
      force: if it fails, then pass
      11) 9_additionalchecks.sh
      force: if it fails, then pass
     *******************************/
    //set
    this._host=addSBCConfig.host;
    this._port=addSBCConfig.port;
    this._existence=Existence.native;
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
    this.CreateEventProgress(`host connection ${sshConnection.Host}:${sshConnection.Port}`);
    result = await sshClient.Connect(sshConnection.ToSshConfig(forceMode),token);
    if(result.Status!=StatusResult.Ok) {
      //event unsubscription
      sshClient.OnChangedStateUnsubscribe(handler);
      return Promise.resolve(result);
    }
    //Tasks Queue
    let taskQueue:TaskQueue<TaskRunScript|TaskPutFile|TaskGetFile>;
    taskQueue = new TaskQueue<TaskRunScript|TaskPutFile>();
    //event subscription
    let handlerTaskQueue=taskQueue.OnChangedStateSubscribe(event => {
      //Progress
      if(event.status)
        this.CreateEventProgress(event.status);
      //output
      if(event.message) {
        if(event.logLevel) app.UI.Output(event.message,event.logLevel);
          else app.UI.Output(event.message);
      }
    });
    let taskRunScript:TaskRunScript;
    let taskPutFile:TaskPutFile;
    let taskGetFile:TaskGetFile;
    let argumentsCommandCliNormal:ArgumentsCommandCli;
    //let argumentsCommandCliForce:ArgumentsCommandCli;
    // ********************************************************************
    // 1_pregetinfo.sh
    // force: 1_pregetinfo_force.sh
    taskRunScript = new TaskRunScript(
      "Installing utilities",
      "1_pregetinfo",undefined,
      "1_pregetinfo_force",undefined);
    taskQueue.Push(taskRunScript);
    // ********************************************************************
    // 2_getinfo.sh
    taskRunScript = new TaskRunScript(
      "Getting information about SBC",
      "2_getinfo",undefined,
      undefined,undefined,
      "ParseGetInfo");
    taskQueue.Push(taskRunScript);
    // ********************************************************************
    // 3_getboardname.sh
    // force: if it fails, then pass
    taskRunScript = new TaskRunScript(
      "Getting board name",
      "3_getboardname",undefined,
      undefined,undefined,
      "ParseGetBoardName",true);
    taskQueue.Push(taskRunScript);
    // ********************************************************************
    // 4_getinfoarmbian.sh
    // force: if it fails, then pass
    taskRunScript = new TaskRunScript(
      "Getting information about Armbian",
      "4_getinfoarmbian",undefined,
      undefined,undefined,
      "ParseGetInfoArmbian",true);
    taskQueue.Push(taskRunScript);
    // ********************************************************************
    // 5_createaccount.sh
    // debugvscode
    argumentsCommandCliNormal = new ArgumentsCommandCli();
    argumentsCommandCliNormal.AddArgument("username",addSBCConfig.debugusername);
    argumentsCommandCliNormal.AddArgument("sshkeytypebits",addSBCConfig.sshkeytypebits ?? "");
    taskRunScript = new TaskRunScript(
      `Create an account '${addSBCConfig.debugusername}'`,
      "5_createaccount",argumentsCommandCliNormal);
    taskQueue.Push(taskRunScript);
    // ********************************************************************
    // get ssh key file of debugvscode
    // debugvscode
    // get file of debugvscode
    const sshKeyFileHostPath = "vscode_authorized_key";
    taskGetFile = new TaskGetFile(
      `Get ssh key of account '${addSBCConfig.debugusername}'`,
      sshKeyFileHostPath, "ParseGetSshKeyOfAccount");
    // obj.username:string, obj.sshkeytypebits:string,
    // obj.keyssbcpath:string, obj.assignment:AccountAssignment
    taskGetFile.ObjForFuncParseData={
        username:addSBCConfig.debugusername,
        sshkeytypebits:addSBCConfig.sshkeytypebits,
        keyssbcpath:app.Config.Folder.KeysSbc,
        assignment:AccountAssignment.debug,
        groups: addSBCConfig.debuggroups ?? []
      };
    taskQueue.Push(taskGetFile);
    // ********************************************************************
    // 5_createaccount.sh
    // managementvscode
    argumentsCommandCliNormal = new ArgumentsCommandCli();
    argumentsCommandCliNormal.AddArgument("username",addSBCConfig.managementusername);
    argumentsCommandCliNormal.AddArgument("sshkeytypebits",addSBCConfig.sshkeytypebits ?? "");
    taskRunScript = new TaskRunScript(
      `Create an account '${addSBCConfig.managementusername}'`,
      "5_createaccount",argumentsCommandCliNormal);
    taskQueue.Push(taskRunScript);
    // ********************************************************************
    // get ssh key file of managementvscode
    // managementvscode
    // get file of managementvscode
    taskGetFile = new TaskGetFile(
      `Get ssh key of account '${addSBCConfig.managementusername}'`,
      sshKeyFileHostPath, "ParseGetSshKeyOfAccount");
    // obj.username:string, obj.sshkeytypebits:string,
    // obj.keyssbcpath:string, obj.assignment:AccountAssignment
    taskGetFile.ObjForFuncParseData={
      username:addSBCConfig.managementusername,
      sshkeytypebits:addSBCConfig.sshkeytypebits,
      keyssbcpath:app.Config.Folder.KeysSbc,
      assignment:AccountAssignment.management,
      groups: addSBCConfig.managementgroups ?? []
    };
    taskQueue.Push(taskGetFile);
    // ********************************************************************
    // 6_addusertogroups.sh
    // debugvscode
    argumentsCommandCliNormal = new ArgumentsCommandCli();
    argumentsCommandCliNormal.AddArgument("username",addSBCConfig.debugusername);
    argumentsCommandCliNormal.AddArgument("groups", IoTHelper.ArrayToString(addSBCConfig.debuggroups ?? [],','));
    argumentsCommandCliNormal.AddArgument("creategroup","yes");
    taskRunScript = new TaskRunScript(
      `Adding the user '${addSBCConfig.debugusername}' to the group(s) '${IoTHelper.ArrayToString(addSBCConfig.debuggroups ?? [],',')}'`,
      "6_addusertogroups",argumentsCommandCliNormal);
    taskQueue.Push(taskRunScript);
    // ********************************************************************
    // 6_addusertogroups.sh
    // managementvscode
    argumentsCommandCliNormal = new ArgumentsCommandCli();
    argumentsCommandCliNormal.AddArgument("username",addSBCConfig.managementusername);
    argumentsCommandCliNormal.AddArgument("groups", IoTHelper.ArrayToString(addSBCConfig.managementgroups ?? [],','));
    taskRunScript = new TaskRunScript(
      `Adding the user '${addSBCConfig.managementusername}' to the group(s) '${IoTHelper.ArrayToString(addSBCConfig.managementgroups ?? [],',')}'`,
      "6_addusertogroups",argumentsCommandCliNormal);
    taskQueue.Push(taskRunScript);
    // ********************************************************************
    // 7_changeconfigssh.sh
    // force: if it fails, then pass
    taskRunScript = new TaskRunScript(
      `Changing OpenSSH settings`,
      "7_changeconfigssh",undefined,
      undefined,undefined,
      undefined,true);
    taskQueue.Push(taskRunScript);
    // udev rules
    const filenameudevrules = addSBCConfig.filenameudevrules;
    if(filenameudevrules!="None") {
      // ********************************************************************
      // Copying the udev rules file
      // put file 20-gpio-fastiot.rules in folder /etc/udev/rules.d
      // force: if it fails, then pass
      result = app.Config.Sbc.GetFileUdevRules(filenameudevrules);
      if(result.Status==StatusResult.Ok) {
        //event unsubscription
        const dataFile=<string>result.returnObject;
        const destFilePath=
          `${Constants.folderDestForFileUdevRules}/${filenameudevrules}`;
        taskPutFile = new TaskPutFile(`Copying the udev rules file '${filenameudevrules}'`,
          destFilePath, dataFile,undefined,true);
        //
        taskQueue.Push(taskPutFile);
      }else {
        this.CreateEvent(result);
      }
      // ********************************************************************
      // 8_applyudevrules.sh
      // force: if it fails, then pass
      taskRunScript = new TaskRunScript(
        `Apply udev rules`,
        "8_applyudevrules",undefined,
        undefined,undefined,
        undefined,true);
      taskQueue.Push(taskRunScript);
    }
    // ********************************************************************
    // 9_additionalchecks.sh
    // force: if it fails, then pass
    taskRunScript = new TaskRunScript(
      "Additional checks",
      "9_additionalchecks",undefined,
      undefined,undefined,
      "ParseAdditionalChecks",
      true);
    taskQueue.Push(taskRunScript);
    // run taskQueue
    result = await taskQueue.Run(sshClient,this,token);
    //
    if(result.Status==StatusResult.Ok) {
      //report
      this.CreateEvent(taskQueue.GetReport());
      result=new IotResult(StatusResult.Ok,`Single-board computer profile created`);
    }else {
      result.AddMessage("Single-board computer profile creation error");
    }
    //event unsubscription    
    taskQueue.OnChangedStateUnsubscribe(handlerTaskQueue);
    //Dispose
    taskQueue.Dispose();
    //result
    //event unsubscription
    sshClient.OnChangedStateUnsubscribe(handler);
    await sshClient.Close();
    await sshClient.Dispose();
    return Promise.resolve(result);
  }

  private async RunScriptAsManagementAccount(fileNameScript:string,token?:vscode.CancellationToken): Promise<IotResult> {
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
    result = await sshClient.Connect(account.ToSshConfig(),token);
    if(result.Status!=StatusResult.Ok) {
      await sshClient.Close();
      await sshClient.Dispose();
      return Promise.resolve(result);
    }
    //run script
    result=await sshClient.RunScript(fileNameScript, undefined, token, true,true);
    await sshClient.Close();
    await sshClient.Dispose();
    return Promise.resolve(result);
  }

  public async Reboot(token?:vscode.CancellationToken): Promise<IotResult> {
    let result:IotResult;
    result = await this.RunScriptAsManagementAccount("reboot",token);
    return Promise.resolve(result);
  }

  public async Shutdown(token?:vscode.CancellationToken): Promise<IotResult> {
    let result:IotResult;
    result = await this.RunScriptAsManagementAccount("shutdown",token);
    return Promise.resolve(result);
  }

  public SetLabel(newLabel:string): IotResult {
    let result:IotResult;
    newLabel = IoTHelper.StringTrim(newLabel);
    if(newLabel=="") {
      result = new IotResult(StatusResult.Error,`The new name cannot be empty`);
      return result;
    }
    let newLabel2="None";
    if(this._getUniqueLabelCallback) 
      newLabel2=this._getUniqueLabelCallback(newLabel,'#');
    if(newLabel!=newLabel2||this.Label==newLabel) {
      result = new IotResult(StatusResult.Error,`SBC with the name '${newLabel}' already exists`);
      return result;
    }
    this._label=newLabel;
    result = new IotResult(StatusResult.Ok);
    this.Trigger(ChangeCommand.rename,this.Id);
    return result;
  }

  public SetUniqueLabelCallback(
    getUniqueLabelCallback: (newlabel:string,suffix:string) => string
    ) {
    this._getUniqueLabelCallback=getUniqueLabelCallback;
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

  public ParseGetInfo(data:string):IotResult {
    let result:IotResult;
    result=new IotResult(StatusResult.Ok);
    try {
      //Trim
      data = IoTHelper.StringTrim(data);
      const obj = JSON.parse(data);
      this._hostName=obj.hostname;
      this._architecture=obj.architecture;
      this._osKernel=obj.oskernel;
      this._osName=obj.osname;
      this._osDescription=obj.osdescription;
      this._osRelease=obj.osrelease;
      this._osCodename=obj.oscodename;
      //Label
      this._label=this.HostName;
    } catch (err: any){
      result=new IotResult(StatusResult.Error,"JSON parse error, ParseGetInfo function",err);
    }
    //result
    return result;
  }

  public ParseGetBoardName(data:string):IotResult {
    let result:IotResult;
    result=new IotResult(StatusResult.Ok);
    try {
      //Trim
      data = IoTHelper.StringTrim(data);
      const obj = JSON.parse(data);
      let boardName:string| undefined =obj.boardname;
      if (boardName) {
        //trim
        boardName=IoTHelper.StringTrim(boardName);
        boardName=IoTHelper.ConvertToValidFilename(boardName,"");
        //
        if (boardName!=""&&boardName.length>2) {
          this._boardName=boardName;
        }
      }
    } catch (err: any){
      result=new IotResult(StatusResult.Error,"JSON parse error, ParseGetBoardName function",err);
    }
    //result
    return result;
  }

  public ParseGetInfoArmbian(data:string):IotResult {
    let result:IotResult;
    result=new IotResult(StatusResult.Ok);
    try {
      //Trim
      data = IoTHelper.StringTrim(data);
      const obj = JSON.parse(data);
      this._armbian= new IotSbcArmbian();
      result = this._armbian.Parse(obj);
    } catch (err: any){
      result=new IotResult(StatusResult.Error,"JSON parse error, ParseGetInfoArmbian function",err);
    }
    //result
    return result;
  }

  public ParseGetSshKeyOfAccount(data:string,obj?:any):IotResult {
    // obj.username:string, obj.sshkeytypebits:string,
    // obj.keyssbcpath:string, obj.assignment:AccountAssignment
    let result:IotResult;
    result=new IotResult(StatusResult.Ok);
    try {
      const userName = <string>obj.username;
      const sshKeyTypeBits = <string>obj.sshkeytypebits;
      const keysSbcPath=<string>obj.keyssbcpath;
      const assignment=<AccountAssignment> obj.assignment;
      const groups=<string[]> obj.groups;
      // fileName: b61e0cdc-orangepipc-debugvscode-ed25519-256
      let fileName=`private-key-${this.Id}-${this.HostName}-${userName}-${sshKeyTypeBits}`;
      fileName=IoTHelper.ConvertToValidFilename(fileName,'_');
      var keyFilePath = path.join(keysSbcPath, fileName);
      //write key
      fs.writeFileSync(keyFilePath,data,undefined);
      //create account
      const account:ISbcAccount = new IoTSbcAccount(
        this.Host,this.Port,keysSbcPath);
      account.fromLoginSshKey(this.Host,this.Port,
        userName,keysSbcPath,fileName,
        groups,sshKeyTypeBits,assignment);
      //add account
      this.Accounts.push(account);
    } catch (err: any){
      result=new IotResult(StatusResult.Error,"JSON parse error, ParseGetSshKeyOfAccount function",err);
    }
    //result
    return result;
  }

  public ParseAdditionalChecks(data:string,obj?:any):IotResult {
    // obj.platformsbc:string
    let result:IotResult;
    result=new IotResult(StatusResult.Ok);
    try {
      //Trim
      data = IoTHelper.StringTrim(data);
      const obj = JSON.parse(data);
      //obj.platformsbc
      /*
      innotek GmbH = VirtualBox
      QEMU = KVM/QEMU
      VMware, Inc. = VMware
      */
      if(obj.platformsbc) {
        let platformSbc = <string>obj.platformsbc;
        if(platformSbc.includes("innotek")) platformSbc="VirtualBox";
        if(platformSbc.includes("QEMU")) platformSbc="KVM/QEMU";
        if(platformSbc.includes("VMware")) platformSbc="VMware";
        if(platformSbc!="None") {
          //set Label
          this._label=`${this.Label} ${platformSbc}`;
        }
      }
    } catch (err: any){
      result=new IotResult(StatusResult.Error,"JSON parse error, ParseAdditionalChecks function",err);
    }
    //result
    return result;
  }

}
