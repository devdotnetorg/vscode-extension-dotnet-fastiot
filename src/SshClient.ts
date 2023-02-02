import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {IotDevice} from './IotDevice';
import {IotDeviceAccount} from './IotDeviceAccount';
import {IotDeviceInformation} from './IotDeviceInformation';
import {IotItemTree} from './IotItemTree';
import {IotDevicePackage} from './IotDevicePackage';
import {StatusResult,IotResult} from './IotResult';

import {IoTHelper} from './Helper/IoTHelper';
import SSH2Promise from 'ssh2-promise';
import SFTP from 'ssh2-promise';
import { stringify } from 'querystring';
import SSHConfig from 'ssh2-promise/lib/sshConfig';

import {EventDispatcher,Handler} from './EventDispatcher';
import { spawn } from 'child_process';
import { lookup } from 'dns';

export class SshClient {  
  public OutputChannel:vscode.OutputChannel| undefined;   

  constructor(){}

  //Event
  protected ChangedStateDispatcher = new EventDispatcher<IChangedStateEvent>();
  public OnChangedStateSubscribe(handler: Handler<IChangedStateEvent>):Handler<IChangedStateEvent> {
        this.ChangedStateDispatcher.Register(handler);
        return handler;
  }

  public OnChangedStateUnsubscribe (handler: Handler<IChangedStateEvent>) {
    this.ChangedStateDispatcher.Unregister(handler);
  }

  public FireChangedState(event: IChangedStateEvent) { 
      console.log("onChangedState");
      this.ChangedStateDispatcher.Fire(event);
  }

  public async RunScript(sshConfig:SSHConfig| undefined, ssh:SSH2Promise| undefined,
    pathFolderExtension:string, nameScript:string, paramsScript:string| undefined,
    isStreamOut: boolean, returnSSH2Promise:boolean): Promise<IotResult>{            
      let outSystemMessage:string| undefined;
      let result:IotResult;
      //get script
      let pathFile:string= pathFolderExtension +"\\bashscript\\"+nameScript+".sh";
      console.log(`pathFileScript= ${pathFile}`);      
      if (!fs.existsSync(pathFile)) 
      {        
        console.log(`Bash script file not found! ${nameScript}`);
        return Promise.resolve(new IotResult(StatusResult.Error,"Bash script file not found!",undefined));   
      }
      let dataFile:string= fs.readFileSync(pathFile, 'utf8');
      //connect
      if(!ssh&&sshConfig)
      {
        result=await this.CheckingSshConnection(sshConfig,true);
        if(result.Status==StatusResult.Error) return Promise.resolve(result);
        ssh=<SSH2Promise>result.returnObject;
      }else return Promise.resolve(new IotResult(StatusResult.Error,"Missing ssh config options or SSH2Promise",undefined));
      //put script
	    var sftp = ssh.sftp();		
      try
        {        
          await sftp.writeFile("vscode-dotnetfastiot.sh",dataFile,{encoding:"utf8",flag:"w"});
          console.log(`Ok. Put script ${nameScript}`);
        }
      catch (err:any)
        {
          if(!returnSSH2Promise) await ssh.close();
          console.log(`Error. Put script ${nameScript} ${err}`);
          return Promise.resolve(new IotResult(StatusResult.Error,`Unable to copy ${nameScript}.sh script to remote host`,err));
        }
      //exec script
      let command=`chmod +x vscode-dotnetfastiot.sh && ./vscode-dotnetfastiot.sh`;
      if (paramsScript) command=`${command} ${paramsScript}`;
      console.log(`Exec command: ${command}`);
      //
      if(!isStreamOut)
      {
        //exec one
        try
        {        
          let resultLog = await ssh.exec(command);
          console.log(`Ok. Exec. Output: ${resultLog}`);
          outSystemMessage=resultLog;      
        }
        catch (err:any)
        {
          //if(!returnSSH2Promise) await ssh.close();
          console.log(`Error. Exec.Output: ${err}`);
          return Promise.resolve(new IotResult(StatusResult.Error,`The execution of the ${nameScript}.sh script ended with an error`,err.toString()));
        }
      }else
      {
        //exec stream
        let lastConsoleLine:string="";
        try
        {  

          let socket = await ssh.spawn(command);
          socket.on('data', (data:any) => {
            this.FireChangedState({
              status:undefined,
              console:data,
              obj:undefined
            });
            lastConsoleLine=data.toString();
          })          
          let flagExit:Boolean=false;
          socket.on('close', () => {
            flagExit=true;
          });                    
          //circle          
          do{await IoTHelper.Sleep(300);}while(!flagExit);
          //Check "Successfully"
          lastConsoleLine=IoTHelper.StringTrim(lastConsoleLine);
          if (lastConsoleLine!="Successfully"){            
            return Promise.resolve(new IotResult(StatusResult.Error,`The execution of the ${nameScript}.sh script ended with an error`,lastConsoleLine));
          }
        }
        catch (err:any)
        {
          if(!returnSSH2Promise) await ssh.close();
          console.log(`Error. Exec.Output: ${err}`);
          return Promise.resolve(new IotResult(StatusResult.Error,`The execution of the ${nameScript}.sh script ended with an error`,err));
        }
      }      
      //delete script      
      try
      {        
        let resultLog= await ssh.exec(`rm vscode-dotnetfastiot.sh`);
        console.log(`Ok. Delete script ${resultLog}`);
      }
      catch (err)
      {
        console.log(`Error. Delete script ${nameScript} ${err}`);
      }
      //end processing
      result = new IotResult(StatusResult.Ok,"Successfully",outSystemMessage);
      if(returnSSH2Promise)
      {
        if(!result.returnObject) result.returnObject=ssh;
      }else
      {
        await ssh.close();
      }        
      //
      return Promise.resolve(result);   
  }

  public async GetFile(sshConfig:SSHConfig, ssh:SSH2Promise| undefined,
    pathFile:string, returnSSH2Promise:boolean): Promise<IotResult>
    {                  
      let outSystemMessage:string| undefined;
      let result:IotResult;
      //connect
      if(!ssh&&sshConfig)
      {
        result=await this.CheckingSshConnection(sshConfig,true);
        if(result.Status==StatusResult.Error) return Promise.resolve(result);
        ssh=<SSH2Promise>result.returnObject;
      }else return Promise.resolve(new IotResult(StatusResult.Error,"Missing ssh config options or SSH2Promise",undefined));
      //get file
	    var sftp = ssh.sftp();		
      try
        {        
          outSystemMessage= await sftp.readFile(pathFile,"utf8");
          console.log(`Ok. Get file ${pathFile}`);
        }
      catch (err:any)
        {
          console.log(`Error. Get file ${pathFile} ${err}`);
          return Promise.resolve(new IotResult(StatusResult.Error,`Unable to read file ${pathFile}`,err));
        }            
      //end processing
      result = new IotResult(StatusResult.Ok,"Successfully",outSystemMessage);
      if(returnSSH2Promise){
        if(!result.returnObject) result.returnObject=ssh;
      } else await ssh.close();      
      //
      return Promise.resolve(result);   
  }

  public async PutFile(sshConfig:SSHConfig, ssh:SSH2Promise| undefined,
    pathFile:string, dataFile:string, fileType:string, returnSSH2Promise:boolean): Promise<IotResult>
  {   
      //fileType - The encoding can be 'utf8', 'ascii', or 'base64'.
      let result:IotResult;
      //connect
      if(!ssh)
      {
        result=await this.CheckingSshConnection(sshConfig,true);
        if(result.Status==StatusResult.Error) return Promise.resolve(result);
        ssh=<SSH2Promise>result.returnObject;
      }
      //put file
	    var sftp = ssh.sftp();
      //fileType
      let jsonOptions = {
        encoding:fileType,
        flag:"w"
      };
      //
      try
        {        
          await sftp.writeFile(pathFile,dataFile,jsonOptions);
          console.log(`Ok. Put file ${pathFile}`);
        }
      catch (err:any)
        {
          console.log(`Error. Get file ${pathFile} ${err}`);
          return Promise.resolve(new IotResult(StatusResult.Error,`Unable to write file ${pathFile}`,err));
        }            
      //end processing
      result = new IotResult(StatusResult.Ok,"Successfully",undefined);
      if(returnSSH2Promise){
        if(!result.returnObject) result.returnObject=ssh;
      } else await ssh.close();    
      //
      return Promise.resolve(result);
  }
  
  public async ReadDir(sshConfig:SSHConfig, ssh:SSH2Promise| undefined,
    path:string, returnSSH2Promise:boolean): Promise<IotResult>
    {                  
      let outSystemMessage:string| undefined;
      let result:IotResult;
        //connect
        if(!ssh)
        {
          result=await this.CheckingSshConnection(sshConfig,true);
          if(result.Status==StatusResult.Error) return Promise.resolve(result);
          ssh=<SSH2Promise>result.returnObject;
        }    
      //read dir
	    var sftp = ssh.sftp();		
      try
        {        
          outSystemMessage= await sftp.readdir(path);
          console.log(`Ok. Read dir ${path}`);
        }
      catch (err:any)
        {
          console.log(`Error. Read dir ${path} ${err}`);
          return Promise.resolve(new IotResult(StatusResult.Error,`Unable to read dir ${path}`,err));
        }            
      //end processing
      result = new IotResult(StatusResult.Ok,"Successfully",outSystemMessage);
      if(returnSSH2Promise) result.returnObject=ssh; else await ssh.close();      
      //
      return Promise.resolve(result);   
  }

  private CheckSshConfig(sshConfig:SSHConfig):IotResult
  {
    let result:IotResult;
    result=new IotResult(StatusResult.Ok,undefined,undefined);
    //identity
    const identity=sshConfig.identity;
    if(identity){
      //checking for the existence of a key
      if (!fs.existsSync(identity)) result=new IotResult(StatusResult.Error, `Error. SSH key not found: ${identity}`,undefined);
    }
    return result;
  }
  
  public async PingHost(ipAddress:string, numberOfEchos = 3, timeout = 1): Promise<IotResult>{
    //checking host availability by IPAddress
    const ping = require('pingman');
    try
    {
      const response = await ping(ipAddress,{logToFile:false, numberOfEchos: numberOfEchos, timeout: timeout, IPV4: true});
      const packetLoss=<number>response.packetLoss;
      if(packetLoss>50)
        return Promise.resolve(new IotResult(StatusResult.Error,`The host with IP-Address ${ipAddress} is unavailable.
             Check your network connection`,undefined));        
    } catch (err:any) {
      return Promise.resolve(new IotResult(StatusResult.Error,`The host with IP-Address ${ipAddress} is unavailable.
           Check your network connection`,err));   
    }
    // TODO: need ping port

    //end processing
    return Promise.resolve(new IotResult(StatusResult.Ok,undefined,undefined));
  }

  public async CheckingSshConnection(sshConfig:SSHConfig,returnSSH2Promise=false): Promise<IotResult>{
    let result:IotResult;
    result=this.CheckSshConfig(sshConfig);
    if(result.Status==StatusResult.Error) return Promise.resolve(result);
    let ssh = new SSH2Promise(sshConfig,undefined);
    let msg="";
    try
      {
        //keyboard-interactive
        if(sshConfig.tryKeyboard)
        {                
          ssh = ssh.addListener(
          'keyboard-interactive',
          (name, instructions, instructionsLang, prompts, finish) => {
            console.log("Connection :: keyboard-interactive");
            finish([sshConfig.password]);
          });
        }
        //      
        await ssh.connect();
        msg=`Connection established SSH:${sshConfig.host}`;
        console.log(msg);
        result=new IotResult(StatusResult.Ok,msg,undefined);
        if(returnSSH2Promise) result.returnObject=ssh; else await ssh.close();
      }
    catch (err: any)
      {
        msg=`Not Connected SSH:${sshConfig.host}!`;
        console.log(msg);
        result=new IotResult(StatusResult.Error,msg,err);
      }
    //end processing
    return Promise.resolve(result);
  }
}

export interface IChangedStateEvent {
  status:string|undefined,
  console:string|undefined,
  obj:any|undefined
}
