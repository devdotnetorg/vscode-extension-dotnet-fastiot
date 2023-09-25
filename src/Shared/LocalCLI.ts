import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import * as child_process from 'child_process';

import { IotResult,StatusResult } from '../Shared/IotResult';
import { IoTHelper } from '../Helper/IoTHelper';
import { ClassWithEvent } from './ClassWithEvent';

export class LocalCLI extends ClassWithEvent {
  
  constructor(){
    super();
  }

  public async Run(command:string, token?:vscode.CancellationToken, getStdout?:boolean): Promise<IotResult> {
    //https://github.com/mortend/dotnet-run/blob/master/index.js
    let result:IotResult;
    let msg:string| undefined;
    let flagExit:Boolean=false;
    let killProc:Boolean=false;
    let stackErr:string[]=[];
    stackErr.push("Error stack");
    if(token) {
      token.onCancellationRequested(() => {
        killProc=true;
        flagExit=true;
      });
     }
    //Event
    this.CreateEvent("--------------------------------------------");
    stackErr.push("--------------------------------------------");
    msg=`Run: ${command}`;
    this.CreateEvent(msg);
    stackErr.push(msg);
    this.CreateEvent("--------------------------------------------");
    stackErr.push("--------------------------------------------");
    //Exec stream
    let lastConsoleLine:string="";
    let outSystemMessage:string="";
    let codeErr:string|undefined;
    let stdErr:string="";
    try {
      const ps = child_process.spawn(command,{
        shell: true,
      });
      //events
      ps.stdout.on('data', (data:any) => {
        lastConsoleLine=data.toString('utf8');
        if(getStdout) {
          outSystemMessage=outSystemMessage+lastConsoleLine;
        } else {
          this.CreateEvent(lastConsoleLine);
        }
      });
      ps.stderr.on('data', (data:any) => {
        if(data) stdErr=`${stdErr}${data}`;
      });
      ps.on('exit', (code:any) => {
        if (code) codeErr=code.toString(); else this.CreateEvent("Successfully");
        flagExit=true;
      });
      ps.stdin.end();
      //circle          
      do{await IoTHelper.Sleep(100);}while(!flagExit);
      if(killProc) ps.kill();
      await IoTHelper.Sleep(200);
      //check isCancellationRequested
      if(token&&token.isCancellationRequested) {
        msg=`The execution of the '${command}' was canceled by the user!`;
          return Promise.resolve(new IotResult(StatusResult.Error,msg));
      }
      //output
      stackErr.push(outSystemMessage);
      if(stdErr!="") {
        stdErr=stdErr.replace(`W: `,`WARNING: `).replace(`E: `,`ERROR: `);
        stdErr=IoTHelper.StringTrim(stdErr);
        this.CreateEvent(`STDERR: ${stdErr}`);
        stackErr.push(`STDERR: ${stdErr}`);
      } 
      if(codeErr) {
        this.CreateEvent(`CODEERR: ${codeErr}`);
        stackErr.push(`CODEERR: ${codeErr}`);
      }
      //Check "Successfully" OR codeErr
      lastConsoleLine=IoTHelper.StringTrim(lastConsoleLine);
      if (!lastConsoleLine.includes("Successfully")||!lastConsoleLine.includes("successfully")) {
        if(codeErr) {
          msg=`The execution of the '${command}' ended with an error`;
          if(!getStdout) {
            //as stream
            return Promise.resolve(new IotResult(StatusResult.Error, msg, lastConsoleLine));
          }else {
            //as out
            const msgStackErr = IoTHelper.ArrayToString(stackErr,'\n');
            return Promise.resolve(new IotResult(StatusResult.Error, msg, msgStackErr));
          }
        }
      }
    }
    catch (err:any) {
      return Promise.resolve(new IotResult(StatusResult.Error,`The execution of the '${command}' ended with an error`,err));
    }
    //end processing
    result = new IotResult(StatusResult.Ok,"Successfully");
    if(getStdout) {
      outSystemMessage=IoTHelper.StringTrim(outSystemMessage);
      result.AddSystemMessage(outSystemMessage);
    }
    //result
    return Promise.resolve(result);   
  }

}
