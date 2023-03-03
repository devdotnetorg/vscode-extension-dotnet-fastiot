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

  public AddMessage = (value: string|undefined) =>
    {if(value) this._message=`${this._message}\n${value}`};

  public AddSystemMessage= (value: string|undefined) =>
    {if(value) this._systemMessage=`${this._systemMessage}\n${value}`};

  /*
  public AppendResult(value: IotResult): void{
    this._status=value.Status;
    this.AddMessage(value.Message);
    this.AddSystemMessage(value.SystemMessage);
  }
  */

  public toString():string{
    //Status
    let msg=`[${this.Status.toString().toUpperCase()}]`;
    //Message
    if(this.Message) msg=`${msg} ${this.Message}.`;
    //SystemMessage
    if(this.SystemMessage) msg=`${msg}\nSystem message: ${this.SystemMessage}`;
    return msg;
  }

  public toStringWithHead():string{
    let msg="";
    //HEAD
    msg=msg+"------------- Result -------------\n";
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
  