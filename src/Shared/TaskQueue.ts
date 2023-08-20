import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IoT } from '../Types/Enums';
import LogLevel = IoT.Enums.LogLevel;
import { SshClient } from '../Shared/SshClient';
import { TaskRunScript } from './TaskRunScript';
import { TaskPutFile } from '../Shared/TaskPutFile';
import { AddSBCConfigType } from '../Types/AddSBCConfigType';
import { ClassWithEvent } from './ClassWithEvent';
import { IoTHelper } from '../Helper/IoTHelper';
import { ISbc } from '../Sbc/ISbc';

export enum TasResult { None="None", OkNormal="OkNormal", OkForce="OkForce", Error="Error" };

export class TaskQueue <T extends TaskRunScript|TaskPutFile> extends ClassWithEvent {
  private _data:Array<T>;
  public get Length(): number {
    return  this._data.length;}
  /** Id, result */
  private _executionResult:Map<string,TasResult>= new Map<string,TasResult>();

  public constructor() {
    super();
    this._data=[];
  }

  public Push(item:T): number {
    return this._data.push(item);
  }

  public async Run(sshClient:SshClient, sbc: ISbc, token?:vscode.CancellationToken): Promise<IotResult> {
    let result:IotResult| undefined;
    for(var i = 0;i<this.Length;i++) {
      let task = this._data[i];
      //Event
      this.CreateEvent( IoTHelper.FirstLetter(`step ${i+1} of ${this.Length}. ${task.Label}`));
      this.CreateEventProgress(`step ${i+1} of ${this.Length}. ${task.Label}`);
      //***************************************************/
      //TaskRunScript
      if(task instanceof TaskRunScript ) {
        let fileNameScript=task.NormalModeFileNameScript;
        let argumentScript=task.NormalModeArgumentScript;
        let isStdout:boolean=false;
        if(task.FuncNameParseData) isStdout=true;
        //Normal
        result = await sshClient.RunScript(
          fileNameScript,argumentScript,token,isStdout);
        this.CreateEvent(result);
        if(result.Status==StatusResult.Ok) {
          //NormalMode Ok
          this._executionResult.set(task.Id,TasResult.OkNormal);
        }else {
          //NormalMode Error
          //check force mode
          if(task.ForceModeFileNameScript) {
            this.CreateEvent("********  Forced mode enabled ********");
            fileNameScript=task.ForceModeFileNameScript;
            argumentScript=task.ForceModeArgumentScript;
            result = await sshClient.RunScript(
              fileNameScript,argumentScript,token,isStdout);
            this.CreateEvent(result);
            if(result.Status==StatusResult.Ok)
              //ForceMode Ok
              this._executionResult.set(task.Id,TasResult.OkForce);
          }
        }
        //Callback
        if(result.Status==StatusResult.Ok && task.FuncNameParseData) {
          //
          let functionName:string;
          if(!task.ObjForFuncParseData) {
            functionName=`sbc.${task.FuncNameParseData}(result.SystemMessage ?? "")`;
          }else {
            functionName= `sbc.${task.FuncNameParseData}(result.SystemMessage ?? "",task.ObjForFuncParseData)`;
          }
          result = <IotResult> eval(functionName);
          if(result.Status!=StatusResult.Ok) this.CreateEvent(result);
        }
      }
      //***************************************************/
      //TaskPutFile
      if(task instanceof TaskPutFile) {
        result = await sshClient.PutFile(
          task.DestFilePath,task.DataFile,task.FileType);
        this.CreateEvent(result);
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
    for(var i = 0;i<this.Length;i++) {
      let task = this._data[i];
      const taskResult = this._executionResult.get(task.Id);
      if (taskResult) {
        switch(taskResult) { 
          case TasResult.OkNormal: {
            str=`🟢 ${i+1}. ${task.Label};`;
            counterTaskOk++;
            break; 
          } 
          case TasResult.OkForce: { 
            str=`🟡 ${i+1}. ${task.Label} (in forced mode);`;
            break; 
          }
          case TasResult.Error: { 
            str=`🔴 ${i+1}. ${task.Label};`;
            break; 
          } 
          default: { 
            str=`⛔ ${i+1}. ${task.Label};`;
            break; 
          } 
        }
      } else {
        //not start
        str=`⚪ ${i+1}. ${task.Label} (not start);`;
      }
      //add
      result=`${result}${str}\n`;
    }
    result=`${result}Successfully completed ${counterTaskOk} out of ${this.Length} tasks.`;
    //result
    return  result;
  }

  /**
   * Dispose
   */
  public Dispose () {
    this._executionResult= new Map<string,TasResult>();
    this._data.splice(0);
  }

}
  