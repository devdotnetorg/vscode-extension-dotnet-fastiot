import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { LogLevel } from './LogLevel';
   
export enum StatusResult { None="None", Ok="Ok", No ="No", Error="Error" };

export class IotResult {  
  private readonly _status: StatusResult;  
  public get Status(): StatusResult {
    return this._status;}

  private _message?: string;  
  public get Message(): string|undefined {
    return this._message;}

  private _systemMessage?: string;  
  public get SystemMessage(): string|undefined {
    return this._systemMessage;}

  public returnObject?:any;
  public tag?: string;
  public logLevel?:LogLevel;

  constructor(
    status:StatusResult, message?:string,
    systemMessage?:string, logLevel?:LogLevel,
    ){
      this._status=status;
      this._message=message;
      this._systemMessage=systemMessage;
      this.logLevel=logLevel;
    }

  public AddMessage = (value?: string) =>
    {if(value) this._message=`${this._message}\n${value}`};

  public AddSystemMessage= (value?: string) =>
    {if(value) this._systemMessage=`${this._systemMessage}\n${value}`};

  public toString():string{
    let msg=``;
    //Status
    if(this.Status!=StatusResult.None) msg=`[${this.Status.toString().toUpperCase()}] `;
    //Message
    if(this.Message) msg=`${msg}${this.Message}.`;
    //SystemMessage
    if(this.SystemMessage) msg=`${msg}\nSystem message: ${this.SystemMessage}`;
    return msg;
  }

  public toStringWithHead(head?:string):string{
    if(!head) head="------------- Result -------------";
    //Msg
    let msg=`${head}\n`;
    //Status
    msg=`${msg}Status: ${this.Status.toString().toUpperCase()}`;
    //Message
    if(this.Message) msg=`${msg}\nMessage: ${this.Message}.`;
    //SystemMessage
    if(this.SystemMessage) msg=`${msg}\nSystem message: ${this.SystemMessage}`;
    //HEAD
    msg=msg+"\n----------------------------------";
    return msg;
  }

  //result.RunTask(()=>this._contextUI.Output(result),()=> {return Promise.resolve(result)});
  public RunTask(ifOK?:() =>void,ifError?:() =>void) {
    switch(this.Status) { 
      case StatusResult.Ok: {
        if(ifOK) ifOK();
        break; 
      } 
      case StatusResult.Error: {
        if(ifError) ifError();
        break;
      }
      default: {
        vscode.window.showWarningMessage(`No task to execute`);
        break; 
      } 
   }
  }
 }
  