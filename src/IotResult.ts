import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {BaseTreeItem} from './BaseTreeItem';
import {IotDeviceAccount} from './IotDeviceAccount';
import {IotDeviceInformation} from './IotDeviceInformation';
   
export enum StatusResult { None="None", Ok="Ok", No ="No", Error="Error"};

export class IotResult {  
  private _status: StatusResult;  
  public get Status(): StatusResult {
    return this._status;}

  private _message: string|undefined;  
  public get Message(): string|undefined {
    return this._message;}

  private _systemMessage: string|undefined;  
  public get SystemMessage(): string|undefined {
    return this._systemMessage;}
  //  
  public returnObject:any|undefined;
  public tag: string|undefined;

  constructor(
    status:StatusResult,
    message:string|undefined,
    systemMessage:string|undefined,
    ){
      this._status=status;
      this._message=message;
      this._systemMessage=systemMessage;
    }       
  public async AppendResult(iotResult: IotResult): Promise<void>{
    this._status=iotResult.Status;
    this._message=iotResult.Message;
    if(!this._systemMessage) this._systemMessage=iotResult.SystemMessage;
    this._systemMessage=this.SystemMessage+ '\n '+ iotResult.SystemMessage;
    this._systemMessage.toString()   
  }

  public toString():string{
    let msg="";
    msg=msg+this.Status.toString();
    if(this.Message) msg=msg+" "+this.Message;
    if(this.SystemMessage) msg=msg+" "+this.SystemMessage;
    return msg;
  }
 }
  