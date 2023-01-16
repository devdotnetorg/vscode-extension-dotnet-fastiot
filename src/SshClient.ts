import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {IotDevice} from './IotDevice';
import {IotDeviceAccount} from './IotDeviceAccount';
import {IotDeviceInformation} from './IotDeviceInformation';
import {IotItemTree} from './IotItemTree';
import {IotDevicePackage} from './IotDevicePackage';
import {StatusResult,IotResult} from './IotResult';

import {Sleep,StringTrim} from './Helper/IoTHelper';
import SSH2Promise from 'ssh2-promise';
import SFTP from 'ssh2-promise';
import { stringify } from 'querystring';

import {EventDispatcher,Handler} from './EventDispatcher';
import { spawn } from 'child_process';
import { lookup } from 'dns';

//

export class SshClient {  
  public OutputChannel:vscode.OutputChannel| undefined;   

  constructor(    
  ){    
  }

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

  public async RunScript(sshConfig:any| undefined, ssh:SSH2Promise| undefined,
    pathFolderExtension:string, nameScript:string, paramsScript:string| undefined,
    isStreamOut: boolean, returnSSH2Promise:boolean): Promise<IotResult>{            
      let outSystemMessage:string| undefined;
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
      if(!ssh)
      {
        ssh = new SSH2Promise(sshConfig);
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
            console.log("Connection established SSH");
          }
        catch (err:any)
          {
            console.log("Not Connected SSH");
            return Promise.resolve(new IotResult(StatusResult.Error,"Not Connected SSH! Check the login, password, ssh server and file /etc/ssh/sshd_config",err));
          }
        }          
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
          do{await Sleep(300);}while(!flagExit);
          //Check "Successfully"
          lastConsoleLine=StringTrim(lastConsoleLine);
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
      let result = new IotResult(StatusResult.Ok,"Successfully",outSystemMessage);
      if(returnSSH2Promise)
      {
        result.returnObject=ssh;
      }else
      {
        ssh.close();
      }        
      //
      return Promise.resolve(result);   
  }

  public async GetFile(sshConfig:any| undefined, ssh:SSH2Promise| undefined,
    pathFile:string, returnSSH2Promise:boolean): Promise<IotResult>
    {                  
      let outSystemMessage:string| undefined;
      //connect
      if(!ssh)
      {
        ssh = new SSH2Promise(sshConfig);
        try
          {        
            await ssh.connect();
            console.log("Connection established SSH");
          }
        catch (err:any)
          {
            console.log("Not Connected SSH")
            return Promise.resolve(new IotResult(StatusResult.Error,"Not Connected SSH!",err));
          }
        }          
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
      let result = new IotResult(StatusResult.Ok,"Successfully",outSystemMessage);
      if(returnSSH2Promise) result.returnObject=ssh; else await ssh.close();      
      //
      return Promise.resolve(result);   
  }

  public async PutFile(sshConfig:any| undefined, ssh:SSH2Promise| undefined,
    pathFile:string, dataFile:string, fileType:string, returnSSH2Promise:boolean): Promise<IotResult>
  {   
      //fileType - The encoding can be 'utf8', 'ascii', or 'base64'.
      //connect
      if(!ssh)
      {
        ssh = new SSH2Promise(sshConfig);
        try
          {        
            await ssh.connect();
            console.log("Connection established SSH");
          }
        catch (err:any)
          {
            console.log("Not Connected SSH")
            return Promise.resolve(new IotResult(StatusResult.Error,"Not Connected SSH!",err));
          }
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
      let result = new IotResult(StatusResult.Ok,"Successfully",undefined);
      if(returnSSH2Promise) result.returnObject=ssh; else await ssh.close();      
      //
      return Promise.resolve(result);
  }
  
  public async ReadDir(sshConfig:any| undefined, ssh:SSH2Promise| undefined,
    path:string, returnSSH2Promise:boolean): Promise<IotResult>
    {                  
      let outSystemMessage:string| undefined;
      //connect
      if(!ssh)
      {
        ssh = new SSH2Promise(sshConfig);
        try
          {        
            await ssh.connect();
            console.log("Connection established SSH");
          }
        catch (err:any)
          {
            console.log("Not Connected SSH")
            return Promise.resolve(new IotResult(StatusResult.Error,"Not Connected SSH!",err));
          }
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
      let result = new IotResult(StatusResult.Ok,"Successfully",outSystemMessage);
      if(returnSSH2Promise) result.returnObject=ssh; else await ssh.close();      
      //
      return Promise.resolve(result);   
  }
  
  public async Ping(ipAddress:string, numberOfEchos = 3, timeout = 1): Promise<IotResult>{
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
    //end processing
    return Promise.resolve(new IotResult(StatusResult.Ok,undefined,undefined));
  }
}

export interface IChangedStateEvent {
  status:string|undefined,
  console:string|undefined,
  obj:any|undefined
}
