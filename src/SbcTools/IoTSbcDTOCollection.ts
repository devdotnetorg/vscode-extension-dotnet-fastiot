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

import { SbcAccountType } from '../Types/SbcAccountType';
import { IoT } from '../Types/Enums';
import AccountAssignment = IoT.Enums.AccountAssignment;
import ChangeCommand = IoT.Enums.ChangeCommand;
import { ISbcAccount } from '../Sbc/ISbcAccount';
import SSHConfig from 'ssh2-promise/lib/sshConfig';
import { enumHelper } from '../Helper/enumHelper';
import { SshConnection } from '../Shared/SshConnection';
import { ClassWithEvent } from '../Shared/ClassWithEvent';
import { ISbc } from '../Sbc/ISbc';
import { IoTDTOAdapters } from "./IoTDTOAdapters"
import { SbcDtoAdapterType } from "../Types/SbcDtoAdapterType"
import { AppDomain } from '../AppDomain';
import { ISshConnection } from '../Shared/ISshConnection';
import { SshClient } from '../Shared/SshClient';
import { SbcDtoType } from '../Types/SbcDtoType';
import { ArgumentsCommandCli } from '../Shared/ArgumentsCommandCli';

export class IoTSbcDTOCollection extends ClassWithEvent {
  private readonly _nameFolderDtoScripts="dto";

  private _items:Array<SbcDtoType>;
  private _adapter?:SbcDtoAdapterType;
  private _account?: ISbcAccount;

  public get Count(): number {
    return this._items.length;}
  
  constructor() {
    super();
    this._items = new Array<SbcDtoType>();
  }

  public Init(account: ISbcAccount, adapter:SbcDtoAdapterType) {
    this._account= account;
    this._adapter=adapter;
  }

  private async GetSshClient(token?:vscode.CancellationToken): Promise<IotResult> {
    //base
    let result:IotResult;
    if(!this._adapter||!this._account)
      return Promise.resolve(new IotResult(StatusResult.Error,"There is no supported DTO adapter for this SBC"));
    const app = AppDomain.getInstance().CurrentApp;
    //test connection
    result = await this._account.ConnectionTest();
    if(result.Status!=StatusResult.Ok)
      return Promise.resolve(result);
    //SshClient
    let sshClient = new SshClient(app.Config.Folder.BashScripts);
    result = await sshClient.Connect(this._account.ToSshConfig(),token);
    if(result.Status==StatusResult.Ok) result.returnObject=sshClient;
    //result
    return Promise.resolve(result);
  }

  public FindByName(name:string): SbcDtoType| undefined {
    let node = this._items.find(x=>x.name==name);
    return node;
  }

  public async Load(token?:vscode.CancellationToken): Promise<IotResult> {
    const msgErr="Error getting DTOs";
    //base
    if(!this._adapter||!this._account)
      return Promise.resolve(new IotResult(StatusResult.Error,"There is no supported DTO adapter for this SBC"));
    let result:IotResult;
    result = await this.GetSshClient(token);
    if(result.Status!=StatusResult.Ok) {
      result.AddMessage(msgErr);
      return Promise.resolve(result);
    }
    let sshClient = <SshClient>result.returnObject;
    //main
    result = await sshClient.RunScript(
      path.join(this._nameFolderDtoScripts,this._adapter.GetallOverlayNameScript),
      undefined,token,true);
    if(result.Status!=StatusResult.Ok) {
      result.AddMessage(msgErr);
      return Promise.resolve(result);
    }
    //parse
    result = this.ParseLoad(result.SystemMessage??"None");
    if(result.Status!=StatusResult.Ok) {
      result.AddMessage(msgErr);
      return Promise.resolve(result);
    }
    //Trigger
    this.Trigger(ChangeCommand.changedDto);
    //result
    result = new IotResult(StatusResult.Ok,"All DTOs have been successfully received");
    await sshClient.Close();
    await sshClient.Dispose();
    return Promise.resolve(result);
  }

  public async Put(fileName:string, dataFile:string, typeFile:string,token?:vscode.CancellationToken): Promise<IotResult> {
    const msgErr=`Error adding DTO file ${fileName}`;
    //base
    if(!this._adapter||!this._account)
      return Promise.resolve(new IotResult(StatusResult.Error,"There is no supported DTO adapter for this SBC"));
    let result:IotResult;
    result = await this.GetSshClient(token);
    if(result.Status!=StatusResult.Ok) {
      result.AddMessage(msgErr);
      return Promise.resolve(result);
    }
    let sshClient = <SshClient>result.returnObject;
    //main
    //put file
    result = await sshClient.PutFile(fileName,dataFile,typeFile);
    if(result.Status!=StatusResult.Ok) {
      result.AddMessage(msgErr);
      return Promise.resolve(result);
    }
    //add file in config
    let argumentsCommandCli:ArgumentsCommandCli;
    argumentsCommandCli = new ArgumentsCommandCli();
    argumentsCommandCli.AddArgument("file",fileName);
    result = await sshClient.RunScript(
      path.join(this._nameFolderDtoScripts,this._adapter.PutOverlayNameScript),
      argumentsCommandCli,token,true);
    if(result.Status!=StatusResult.Ok) {
      result.AddMessage(msgErr);
      return Promise.resolve(result);
    }
    //refresh
    // TODO: сделать без Load
    result= await this.Load(token);
    if(result.Status!=StatusResult.Ok) {
      result.AddMessage(msgErr);
      return Promise.resolve(result);
    }
    //Trigger
    this.Trigger(ChangeCommand.changedDto);
    //result
    result = new IotResult(StatusResult.Ok,`DTO file ${fileName} added successfully`);
    await sshClient.Close();
    await sshClient.Dispose();
    return Promise.resolve(result);
  }

  public async Delete(dto:SbcDtoType,token?:vscode.CancellationToken): Promise<IotResult> {
    const msgErr=`Error deleting DTO file ${dto.name}`;
    //base
    if(!this._adapter||!this._account)
      return Promise.resolve(new IotResult(StatusResult.Error,"There is no supported DTO adapter for this SBC"));
    let result:IotResult;
    result = await this.GetSshClient(token);
    if(result.Status!=StatusResult.Ok) {
      result.AddMessage(msgErr);
      return Promise.resolve(result);
    }
    let sshClient = <SshClient>result.returnObject;
    //main
    let argumentsCommandCli:ArgumentsCommandCli;
    argumentsCommandCli = new ArgumentsCommandCli();
    argumentsCommandCli.AddArgument("path",dto.path);
    result = await sshClient.RunScript(
      path.join(this._nameFolderDtoScripts,this._adapter.DeleteOverlayNameScript),
      argumentsCommandCli,token,true);
    if(result.Status!=StatusResult.Ok) {
      result.AddMessage(msgErr);
      return Promise.resolve(result);
    }
    //refresh
    // TODO: сделать без Load
    result= await this.Load(token);
    if(result.Status!=StatusResult.Ok) {
      result.AddMessage(msgErr);
      return Promise.resolve(result);
    }
    //Trigger
    this.Trigger(ChangeCommand.changedDto);
    //result
    result = new IotResult(StatusResult.Ok,`DTO file ${dto.name} deleting successfully`);
    await sshClient.Close();
    await sshClient.Dispose();
    return Promise.resolve(result);
  }

  public async Enable(dto:SbcDtoType,token?:vscode.CancellationToken): Promise<IotResult> {
    const msgErr=`Error enabling DTO file ${dto.name}`;
    //base
    if(!this._adapter||!this._account)
      return Promise.resolve(new IotResult(StatusResult.Error,"There is no supported DTO adapter for this SBC"));
    let result:IotResult;
    result = await this.GetSshClient(token);
    if(result.Status!=StatusResult.Ok) {
      result.AddMessage(msgErr);
      return Promise.resolve(result);
    }
    let sshClient = <SshClient>result.returnObject;
    //main
    let argumentsCommandCli:ArgumentsCommandCli;
    argumentsCommandCli = new ArgumentsCommandCli();
    argumentsCommandCli.AddArgument("overlay",dto.name);
    result = await sshClient.RunScript(
      path.join(this._nameFolderDtoScripts,this._adapter.EnableOverlayNameScript),
      argumentsCommandCli,token,true);
    if(result.Status!=StatusResult.Ok) {
      result.AddMessage(msgErr);
      return Promise.resolve(result);
    }
    //refresh
    // TODO: сделать без Load
    result= await this.Load(token);
    if(result.Status!=StatusResult.Ok) {
      result.AddMessage(msgErr);
      return Promise.resolve(result);
    }
    //Trigger
    this.Trigger(ChangeCommand.changedDto);
    //result
    result = new IotResult(StatusResult.Ok,`DTO file ${dto.name} enabling successfully`);
    await sshClient.Close();
    await sshClient.Dispose();
    return Promise.resolve(result);
  }

  public async Disable(dto:SbcDtoType,token?:vscode.CancellationToken): Promise<IotResult> {
    const msgErr=`Error disabling DTO file ${dto.name}`;
    //base
    if(!this._adapter||!this._account)
      return Promise.resolve(new IotResult(StatusResult.Error,"There is no supported DTO adapter for this SBC"));
    let result:IotResult;
    result = await this.GetSshClient(token);
    if(result.Status!=StatusResult.Ok) {
      result.AddMessage(msgErr);
      return Promise.resolve(result);
    }
    let sshClient = <SshClient>result.returnObject;
    //main
    let argumentsCommandCli:ArgumentsCommandCli;
    argumentsCommandCli = new ArgumentsCommandCli();
    argumentsCommandCli.AddArgument("overlay",dto.name);
    result = await sshClient.RunScript(
      path.join(this._nameFolderDtoScripts,this._adapter.DisableOverlayNameScript),
      argumentsCommandCli,token,true);
    if(result.Status!=StatusResult.Ok) {
      result.AddMessage(msgErr);
      return Promise.resolve(result);
    }
    //refresh
    // TODO: сделать без Load
    result= await this.Load(token);
    if(result.Status!=StatusResult.Ok) {
      result.AddMessage(msgErr);
      return Promise.resolve(result);
    }
    //Trigger
    this.Trigger(ChangeCommand.changedDto);
    //result
    result = new IotResult(StatusResult.Ok,`DTO file ${dto.name} disabling successfully`);
    await sshClient.Close();
    await sshClient.Dispose();
    return Promise.resolve(result);
  }

  public ToJSON():SbcDtoType[] {
    return this._items;
  }

  public FromJSON(objs:SbcDtoType[]) {
    this._items=objs;
  }

  public *getValues() { // you can put the return type Generator<number>, but it is ot necessary as ts will infer 
    let index = 0;
    while(true) {
        yield this._items[index];
        index = index + 1;
        if (index >= this.Count) {
            break;
        }
    }
  }

  //************************ Parse ************************

  public ParseLoad(data:string):IotResult {
    let result:IotResult;
    result=new IotResult(StatusResult.Ok);
    try {
      //Trim
      data = IoTHelper.StringTrim(data);
      const obj = JSON.parse(data);
      let index=0;
      this._items=[]; 
      do {
        let jsonDto=obj.overlays[index];
        if(jsonDto) {
          //parse
          let isActive=false;
          let typeDto = IoT.Enums.Entity.user;
          if(jsonDto.active == "true")  isActive=true;
          if(jsonDto.type == "system") typeDto = IoT.Enums.Entity.system;
          const dto = {
            name:<string>jsonDto.name,
            path:<string>jsonDto.path,
            active:isActive,
            type:typeDto
          };
          //add
          this._items.push(<SbcDtoType>dto);
          //next position
          index=index+1;
        }else break;
      } while(true)
    } catch (err: any){
      result=new IotResult(StatusResult.Error,"JSON parse error, ParseLoad function",err);
    }
    //result
    return result;
  }

}
