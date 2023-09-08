import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import SSH2Promise from 'ssh2-promise';
import SSHConfig from 'ssh2-promise/lib/sshConfig';
import SFTP from 'ssh2-promise';
import { EventDispatcher,Handler } from '../shared/ClassWithEvent';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IoTHelper } from '../Helper/IoTHelper';
import { ClassWithEvent } from './ClassWithEvent';
import { ArgumentsCommandCli } from './ArgumentsCommandCli';
import { stderr } from 'process';

export class SshClient extends ClassWithEvent {
  private _ssh: SSH2Promise| undefined;
  private _bashScriptsFolder?: string;
  public get IsActive(): boolean {
    if (this._ssh) {
      return true;
    }
    return false;
  }

  private _isConnected: boolean;
  public get IsConnected(): boolean {
    return this._isConnected;}

  constructor(bashScriptsFolder?:string){
    super();
    this._bashScriptsFolder=bashScriptsFolder;
    this._isConnected=false;
  }

  public async Connect(sshConfig:SSHConfig,token?:vscode.CancellationToken): Promise<IotResult> {
    // TODO: use token
    //connect
    let result:IotResult;
    //check IsActive IsConnected
    if(this.IsActive && this.IsConnected) {
      //result
      result= new IotResult(StatusResult.Error,"Connection already established!");
      return Promise.resolve(result);
    }
    //check sshConfig
    result = this.CheckSshKeyExists(sshConfig);
    if(result.Status!=StatusResult.Ok) return Promise.resolve(result);
    //
    try {
      this._ssh = new SSH2Promise(sshConfig);
      //keyboard-interactive
      if(sshConfig.tryKeyboard) {
        this._ssh = this._ssh.addListener(
          'keyboard-interactive',
          (name, instructions, instructionsLang, prompts, finish) => {
            console.log("Connection :: keyboard-interactive");
            finish([sshConfig.password]);
          });
      }
      //main 
      await this._ssh.connect();
      this._isConnected=true;
      result=new IotResult(StatusResult.Ok,`Connection established via SSH protocol. Host: ${sshConfig.host}, port: ${sshConfig.port}.`);
    }
    catch (err: any) {
      //type input - identity (key) or password
      const identity=sshConfig.identity;
      let msg = `Unable to connect via SSH protocol. Host: ${sshConfig.host}, port: ${sshConfig.port}, login: '${sshConfig.username}'`;
      if(identity){
        msg = `${msg}, key 🔑 ${identity}.`;
      } else {
        msg = `${msg}, password ******.`;
      }
      const sysMsg=`level: ${err.level}. message: ${err.message}.`;
      if (err.level&&err.level==`protocol`) msg=msg +` There is no ssh server running on port ${sshConfig.port}.`;
      result=new IotResult(StatusResult.Error,msg,sysMsg);
      return Promise.resolve(result);
    }
    //type input - identity (key) or password
    const identity=sshConfig.identity;
    let msg:string;
    if(identity){
      msg = `Login '${sshConfig.username}' and key 🔑 ${identity} were used to enter.`;
    } else {
      msg = `The login was '${sshConfig.username}' and the password was ******.`;
    }
    result.AddMessage(msg);
    //end processing
    return Promise.resolve(result);
  }

  public async RunScript(fileNameScript:string, argumentScript?:ArgumentsCommandCli,
    token?:vscode.CancellationToken, getStdout?:boolean,doNotWaitRemovingScript?:boolean): Promise<IotResult> {            
      let result:IotResult;
      let msg:string| undefined;
      let flagExit:Boolean=false;
      let stackErr:string[]=[];
      stackErr.push("Error stack");
      if(token) {
        token.onCancellationRequested(() => {
          flagExit=true;
        });
      }
      //check ssh
      if(!this._ssh||!this.IsActive||!this.IsConnected) {
        //result
        result= new IotResult(StatusResult.Error,"You need to connect to the host!");
        return Promise.resolve(result);
      }
      //get script
      if(!this._bashScriptsFolder) {
        //result
        result= new IotResult(StatusResult.Error,"Bash script folder not specified!");
        return Promise.resolve(result);
      }
      let pathFile:string = path.join(this._bashScriptsFolder, `${fileNameScript}.sh`);
      if (!fs.existsSync(pathFile)) {
        return Promise.resolve(new IotResult(StatusResult.Error,`Bash script ${fileNameScript}.sh file not found!`));   
      }
      let dataFile:string= fs.readFileSync(pathFile, 'utf8');
      //CRLF => LF / '\r\n' => '\n'
      dataFile=IoTHelper.SetLineEnding(dataFile);
      //Event
      this.CreateEvent("--------------------------------------------");
      stackErr.push("--------------------------------------------");
      msg=`Run: ${fileNameScript}.sh`;
      if (argumentScript) msg=`${msg} Arguments: ${argumentScript.toString()}`;
      this.CreateEvent(msg);
      stackErr.push(msg);
      this.CreateEvent("--------------------------------------------");
      stackErr.push("--------------------------------------------");
      //put script
	    var sftp = this._ssh.sftp();		
      try {
        await sftp.writeFile("vscode-dotnetfastiot.sh",dataFile,{encoding:"utf8",flag:"w"});
      }
      catch (err:any) {
        return Promise.resolve(new IotResult(StatusResult.Error,`Unable to copy ${fileNameScript}.sh script to remote host`,err));
      }
      //exec script
      let command=`chmod +x vscode-dotnetfastiot.sh && ./vscode-dotnetfastiot.sh`;
      //add argument
      if (argumentScript) command=`${command} ${argumentScript.toString()}`;
      //Exec stream
      let lastConsoleLine:string="";
      let outSystemMessage:string="";
      let codeErr:string|undefined;
      let stdErr:string="";
      try {
        let socket = await this._ssh.spawn(command);
        //events
        socket.on('data', (data:any) => {
          lastConsoleLine=data.toString();
          if(getStdout) {
            outSystemMessage=outSystemMessage+lastConsoleLine;
          } else {
            this.CreateEvent(lastConsoleLine);
          }
        });
        socket.stderr.on('data', (data:any) => {
            if(data) stdErr=`${stdErr}${data}`;
        });
        socket.on('close', (code:any) => {
          if (code) codeErr=code.toString();
          flagExit=true;
        });
        //circle          
        do{await IoTHelper.Sleep(100);}while(!flagExit);
        await IoTHelper.Sleep(200);
        //check isCancellationRequested
        if(token&&token.isCancellationRequested) {
          msg=`The execution of the ${fileNameScript}.sh script was canceled by the user!`;
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
            msg=`The execution of the ${fileNameScript}.sh script ended with an error`;
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
        return Promise.resolve(new IotResult(StatusResult.Error,`The execution of the ${fileNameScript}.sh script ended with an error`,err));
      }    
      //delete script      
      try {
        if(!doNotWaitRemovingScript) await this._ssh.exec(`rm vscode-dotnetfastiot.sh`);
      }
      catch (err) {}
      //end processing
      result = new IotResult(StatusResult.Ok,"Successfully");
      if(getStdout) {
        outSystemMessage=IoTHelper.StringTrim(outSystemMessage);
        result.AddSystemMessage(outSystemMessage);
      }
      //result
      return Promise.resolve(result);   
  }

  public async GetFile(filePath:string): Promise<IotResult> {
    let result:IotResult;
    //check ssh
    if(!this._ssh||!this.IsActive||!this.IsConnected) {
      //result
      result= new IotResult(StatusResult.Error,"You need to connect to the host!");
      return Promise.resolve(result);
    }
    let outSystemMessage:string| undefined;
    //get file
    var sftp = this._ssh.sftp();		
    try {
      outSystemMessage = await sftp.readFile(filePath,"utf8");
    } catch (err:any) {
      return Promise.resolve(new IotResult(StatusResult.Error,`Unable to read file ${filePath}`,err));
    }
    //end processing
    result = new IotResult(StatusResult.Ok,"Successfully",outSystemMessage);
    //result
    return Promise.resolve(result);
  }

  /** fileType - The encoding can be 'utf8', 'ascii', or 'base64'. */
  public async PutFile(destFilePath:string, dataFile:string, fileType:string="utf8"): Promise<IotResult> {
    let result:IotResult;
    //check ssh
    if(!this._ssh||!this.IsActive||!this.IsConnected) {
      //result
      result= new IotResult(StatusResult.Error,"You need to connect to the host!");
      return Promise.resolve(result);
    }
    //put file
    var sftp = this._ssh.sftp();
    //fileType
    const jsonOptions = {
      encoding:fileType,
      flag:"w"
    };
    //
    try {
      await sftp.writeFile(destFilePath,dataFile,jsonOptions);
    } catch (err:any) {
      return Promise.resolve(new IotResult(StatusResult.Error,`Unable to write file ${destFilePath}`,err));
    }            
    //end processing
    result = new IotResult(StatusResult.Ok,"Successfully");
    //result
    return Promise.resolve(result);
  }

  public async ReadDir(dir:string): Promise<IotResult> {
    let result:IotResult;
    //check ssh
    if(!this._ssh||!this.IsActive||!this.IsConnected) {
      //result
      result= new IotResult(StatusResult.Error,"You need to connect to the host!");
      return Promise.resolve(result);
    }
    let outSystemMessage:string| undefined;
    //read dir
	  var sftp = this._ssh.sftp();
    try {
      outSystemMessage= await sftp.readdir(dir);
    } catch (err:any) {
      return Promise.resolve(new IotResult(StatusResult.Error,`Unable to read dir ${dir}`,err));
    }
    //end processing
    result = new IotResult(StatusResult.Ok,"Successfully",outSystemMessage);
    //result
    return Promise.resolve(result);
  }

  public async Close(): Promise<IotResult> {
    let result:IotResult;
    //check ssh
    if(!this._ssh||!this.IsActive||!this.IsConnected) {
      //result
      result= new IotResult(StatusResult.Error,"You need to connect to the host!");
      return Promise.resolve(result);
    }
    try {
      await this._ssh.close();
      this._isConnected=false;
    } catch (err:any) {
      return Promise.resolve(new IotResult(StatusResult.Error,`Connection close error`,err));
    }
    //end processing
    result = new IotResult(StatusResult.Ok,"Successfully");
    //result
    return Promise.resolve(result);
  }

  /**
   * Dispose
   */
  public async Dispose () {
    //check IsActive IsConnected
    if(this.IsActive && this.IsConnected) {
      await this.Close();
    }
    this._isConnected = false;
    this._ssh = undefined;
    this._bashScriptsFolder = "";
  }
  
  private CheckSshKeyExists(sshConfig:SSHConfig):IotResult {
    let result:IotResult;
    result=new IotResult(StatusResult.Ok);
    //identity
    const identity=sshConfig.identity;
    if(identity) {
      //checking for the existence of a key
      if (!fs.existsSync(identity)) result=new IotResult(StatusResult.Error, `SSH key file not found: ${identity}`);
    }
    return result;
  }

}
