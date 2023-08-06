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
import { AppDomain } from '../AppDomain';
import { SbcType } from '../Types/SbcType';
import { ClassWithEvent } from '../Shared/ClassWithEvent';
import { IotSbcArmbian } from './IotSbcArmbian';
import { IoTSbcAccount } from './IoTSbcAccount';
import { enumHelper } from '../Helper/enumHelper';

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
 
  public async Create(addSBCConfigType:AddSBCConfigType):Promise<IotResult> {
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
      force: if it fails, then switching works as ROOT
      6) 6_addusertogroups.sh
      force: if it fails, then switch to return to level (5), work as ROOT
      7) 7_changeconfigssh.sh
      force: if it fails, then pass
      8) 8_addudevrules.sh
      force: if it fails, then pass
     *******************************/
    //
    let result:IotResult;
    this.CreateEvent("Checking the network connection",undefined,0);
    result=await this.ConnectionTestLoginPass(
      addSBCConfigType.host,
      addSBCConfigType.port,
      addSBCConfigType.username,
      addSBCConfigType.password ?? "");
    if(result.Status!=StatusResult.Ok)
      return Promise.resolve(result);

      /*
      Создание профиля одноплатного компьютера
      Create a Single Board Computer Profile

      Create a single-board computer profile
      
      Добавление одноплат

     this._app.UI.Output(result);
       else return Promise.resolve(result);
       this._app.UI.ShowBackgroundNotification("Create a device");
       this._app.UI.Output("Create a device");
     //event subscription
     let handler=device.Client.OnChangedStateSubscribe(event => {        
       if(event.status) this._app.UI.ShowBackgroundNotification(event.status);
       if(event.status) this._app.UI.Output(event.status);
       if(event.console) this._app.UI.Output(event.console); 
     });
     result = await device.Create(hostName,port,userName, password,accountNameDebug);
     if(result.Status==StatusResult.Error) {
       result.AddMessage(`Device not added!`);
       return Promise.resolve(result);
     }
     //Rename. checking for matching names.
     device.label= this.GetUniqueLabel(<string>device.label,'#',undefined);      
     //
     this.RootItems.push(device);
     //save in config      
     this.SaveDevices()
     //Refresh treeView
     this.Refresh();
     //event unsubscription
     device.Client.OnChangedStateUnsubscribe(handler);
     //
     result=new IotResult(StatusResult.Ok,`Device added successfully 🎉! Device: ${device.label}`);
     //return new device
     result.returnObject=device;
     return Promise.resolve(result);   

     */



    
    throw new Error("This is an example exception.");

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

}
