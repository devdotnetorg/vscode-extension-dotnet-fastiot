import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IoT } from '../Types/Enums';
import LogLevel = IoT.Enums.LogLevel;
import { SshClient } from '../Shared/SshClient';
import { TaskRunScript } from './TaskRunScript';
import { TaskPutFile } from '../Shared/TaskPutFile';

export enum TasResult { None="None", OkNormal="OkNormal", OkForce="OkForce", Error="Error" };

export class TaskQueue <T extends TaskRunScript|TaskPutFile> extends Array<T> {

  /** Id, result */
  private _executionResult:Map<string,TasResult>= new Map<string,TasResult>();

  private _createEvent:((message:string|IotResult,logLevel?:LogLevel) =>void)|undefined;
  private _createEventProgress:((status:string,increment?:number) =>void)|undefined;

  public SetCallbacks(createEvent:((message:string|IotResult,logLevel?:LogLevel) =>void),
                    createEventProgress:((status:string,increment?:number) =>void)) {
    this._createEvent=createEvent;
    this._createEventProgress=createEventProgress;
  }

  public async Run(sshClient:SshClient,token?:vscode.CancellationToken): Promise<IotResult> {
    let result:IotResult| undefined;
    for(var i = 0;i<this.length;i++) {
      let task = this[i];
      //Event
      if (this._createEvent)
        this._createEvent(`step ${i+1} of ${this.length}. ${task.Label}`);
      if (this._createEventProgress)
        this._createEventProgress(`step ${i+1} of ${this.length}. ${task.Label}`);
      //***************************************************/
      //TaskRunScript
      if(task instanceof TaskRunScript ) {
        let fileNameScript=task.NormalModeFileNameScript;
        let argumentScript=task.NormalModeArgumentScript;
        let isStdout:boolean=false;
        if(task.ParseDataCallback) isStdout=true;
        //Normal
        result = await sshClient.RunScript(
          fileNameScript,argumentScript,token,isStdout);
        if (this._createEvent)
          this._createEvent(result);
        if(result.Status==StatusResult.Ok) {
          //NormalMode Ok
          this._executionResult.set(task.Id,TasResult.OkNormal);
        }else {
          //NormalMode Error
          //check force mode
          if(task.ForceModeFileNameScript) {
            if (this._createEvent)
              this._createEvent("********  Forced mode enabled ********");
            fileNameScript=task.ForceModeFileNameScript;
            argumentScript=task.ForceModeArgumentScript;
            result = await sshClient.RunScript(
              fileNameScript,argumentScript,token,isStdout);
            if (this._createEvent)
              this._createEvent(result);
            if(result.Status==StatusResult.Ok)
              //ForceMode Ok
              this._executionResult.set(task.Id,TasResult.OkForce);
          }
        }
        //Callback
        if(result.Status==StatusResult.Ok && task.ParseDataCallback) {
          result = task.ParseDataCallback(
            result.SystemMessage ?? "",fileNameScript,argumentScript);
          if (this._createEvent)
            this._createEvent(result);
        }
      }
      //***************************************************/
      //TaskPutFile
      if(task instanceof TaskPutFile) {
        result = await sshClient.PutFile(
          task.DestFilePath,task.DataFile,task.FileType);
        if (this._createEvent)
          this._createEvent(result);
        if(result.Status==StatusResult.Ok)
          this._executionResult.set(task.Id,TasResult.OkNormal);
      }
      //***************************************************/
      //result
      if(result && result.Status!=StatusResult.Ok) {
        this._executionResult.set(task.Id,TasResult.Error);
      }
      if(result && result.Status!=StatusResult.Ok && !task.IsPossibleToSkip) {
        result.AddMessage(`Task execution error: ${task.Label}`);
        if(task.ErrorMessage)
          result.AddMessage(task.ErrorMessage);
        return Promise.resolve(result);
      }
    }
    //result
    result = new IotResult(StatusResult.Ok);
    return Promise.resolve(result);
  }

  /**
   * Report
   */
  public GetReport ():string {
    //report
    let result:string;
    let str:string="";
    let counterTaskOk:number=0;
    result=`Task Checklist:\n`;
    for(var i = 0;i<this.length;i++) {
      let task = this[i];
      const taskResult = this._executionResult.get(task.Id);
      if (taskResult) {
        switch(taskResult) { 
          case TasResult.OkNormal: {
            str=`✔️ ${i+1}) ${task.Label};\n`;
            counterTaskOk++;
            break; 
          } 
          case TasResult.OkForce: { 
            str=`🟡 ${i+1}) ${task.Label} (in forced mode);\n`;
            break; 
          }
          case TasResult.Error: { 
            str=`❌ ${i+1}) ${task.Label};\n`;
            break; 
          } 
          default: { 
            str=`⛔ ${i+1}) ${task.Label};\n`;
            break; 
          } 
        }
        //add
        result=`${str}\n`;
      }
    }
    result=`${result}Successfully completed ${counterTaskOk} out of ${this.length} tasks.`;
    //result
    return  result;
  }

  /**
   * Dispose
   */
  public Dispose () {
    this._executionResult= new Map<string,TasResult>();
    this._createEvent = undefined;
    this._createEventProgress = undefined;
    this.splice(0);
  }

 }
  