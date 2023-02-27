import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
   
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

  public returnObject:any|undefined;
  public tag: string|undefined;

  constructor(
    status:StatusResult,
    message:string|undefined=undefined,
    systemMessage:string|undefined=undefined,
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
    //Status
    let msg=`[${this.Status.toString().toUpperCase()}]`;
    //Message
    if(this.Message) {
      //check dot
      if((this.Message.toString().substring(this.Message.length-1))==".")
        msg=`${msg} ${this.Message}`;
      else msg=`${msg} ${this.Message}.`;
    }
    //SystemMessage
    if(this.SystemMessage) msg=`${msg} ${this.SystemMessage}`;
    return msg;
  }

  public toMultiLineString(format:string|undefined=undefined):string{
    let msg="";
    //HEAD
    if(format&&format=="head") msg=msg+"------------- Result -------------\n";
    //Status
    msg=`${msg}Status: ${this.Status.toString().toUpperCase()}`;
    //Message
    if(this.Message) {
      //check dot
      if((this.Message.toString().substring(this.Message.length-1))==".")
        msg=`${msg}\nMessage: ${this.Message}`;
      else msg=`${msg}\nMessage: ${this.Message}.`;
    }
    //SystemMessage
    if(this.SystemMessage) msg=`${msg}\nSystem message: ${this.SystemMessage}`;
    //HEAD
    if(format&&format=="head") msg=msg+"\n----------------------------------";
    return msg;
  }
 }
  