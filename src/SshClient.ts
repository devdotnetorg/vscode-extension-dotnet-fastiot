import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import SSH2Promise from 'ssh2-promise';
import SSHConfig from 'ssh2-promise/lib/sshConfig';
import SFTP from 'ssh2-promise';
import {EventDispatcher,Handler} from './EventDispatcher';
import {StatusResult,IotResult} from './IotResult';
import {IoTHelper} from './Helper/IoTHelper';

export class SshClient {
  constructor(){}

  //Event--------------------------------------
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
  //-------------------------------------------
  //Main---------------------------------------
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
        return Promise.resolve(new IotResult(StatusResult.Error,"Bash script file not found!"));   
      }
      let dataFile:string= fs.readFileSync(pathFile, 'utf8');
      //CRLF => LF / '\r\n' => '\n'
      dataFile=IoTHelper.SetLineEnding(dataFile);
      //connect
      if(!ssh&&sshConfig)
      {
        result=await this.GetSshConnection(sshConfig,true);
        if(result.Status==StatusResult.Error) return Promise.resolve(result);
        ssh=<SSH2Promise>result.returnObject;
      }else return Promise.resolve(new IotResult(StatusResult.Error,"Missing ssh config options or SSH2Promise"));
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
          if (!lastConsoleLine.includes("Successfully")){            
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
        result=await this.GetSshConnection(sshConfig,true);
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
        result=await this.GetSshConnection(sshConfig,true);
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
      result = new IotResult(StatusResult.Ok,"Successfully");
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
          result=await this.GetSshConnection(sshConfig,true);
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
  //-------------------------------------------
  //Additionally-------------------------------
  private CheckSshConfig(sshConfig:SSHConfig):IotResult
  {
    let result:IotResult;
    result=new IotResult(StatusResult.Ok,undefined,undefined);
    //identity
    const identity=sshConfig.identity;
    if(identity){
      //checking for the existence of a key
      if (!fs.existsSync(identity)) result=new IotResult(StatusResult.Error, `Error. SSH key not found: ${identity}`);
    }
    return result;
  }

  public async GetSshConnection(sshConfig:SSHConfig,returnSSH2Promise=false): Promise<IotResult>{
    //networkHelper
    let result:IotResult;
    result=this.CheckSshConfig(sshConfig);
    if(result.Status==StatusResult.Error) return Promise.resolve(result);
    let ssh = new SSH2Promise(sshConfig);
    try {
      //keyboard-interactive
      if(sshConfig.tryKeyboard) {
        ssh = ssh.addListener(
          'keyboard-interactive',
          (name, instructions, instructionsLang, prompts, finish) => {
            console.log("Connection :: keyboard-interactive");
            finish([sshConfig.password]);
          });
      }
      //main 
      await ssh.connect();
      result=new IotResult(StatusResult.Ok,`Connection established via SSH protocol. Host: ${sshConfig.host}, port: ${sshConfig.port}.`);
      if(returnSSH2Promise) result.returnObject=ssh; else await ssh.close();
    }
    catch (err: any) {
      const msg = `Unable to connect via SSH protocol. Host: ${sshConfig.host}, port: ${sshConfig.port}.`;
      result=new IotResult(StatusResult.Error,msg,err);
    }
    //type input - identity (key) or password
    const identity=sshConfig.identity;
    let msg:string;
    if(identity){
      msg = `Login "${sshConfig.username}" and key ${identity} were used to enter.`;
    } else {
      msg = `The login was "${sshConfig.username}" and the password was ******.`;
    }
    result.Message=`${result.Message}\n${msg}`;
    //end processing
    return Promise.resolve(result);
  }

  //not used
  private GetInstOnSshErrorConnection():string {
    const msg=
      `To solve the problem, visit the Trubleshooting page:\n`+
      `https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/blob/master/docs/Troubleshooting.md`;
    /*
    const msg=
      `Follow the steps to solve the problem:\n`+
      `1. Check if the OpenSSH server is running.\n`+
      `Command: "sudo systemctl status ssh".\n`+
      `2. Check the port number, it should be 22.\n`+
      `Command: "lsof -i :22".\n`+
      `The response should contain a line containing: sshd *:ssh (LISTEN).\n`+
      `3. Check if the login and password are correct.\n`+
      `4. Check your ssh-server settings.\n`+
      `The "/etc/ssh/sshd_config" file should contain the following options:\n`+
      `--------------------------------------\n`+
      `PermitRootLogin yes\n`+
      `PasswordAuthentication yes\n`+
      `ChallengeResponseAuthentication yes\n`+
      `AuthenticationMethods publickey keyboard-interactive password\n`+
      `--------------------------------------\n`+
      `After making the settings, restart ssh-server with the command:\n`+
      `"sudo systemctl reload ssh"\n`+
      `Then remove the device and add it again.\n`+
      `If you are still unable to connect, then run the following command \n`+
      `on the device to get information about the connection problem using the ssh protocol:\n`+
      `"sudo systemctl status ssh".\n`+
      `Visit the Trubleshooting page - https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/blob/master/docs/Troubleshooting.md`;
    */
    return msg;
  }
  //-------------------------------------------
}

export interface IChangedStateEvent {
  status:string|undefined,
  console:string|undefined,
  obj:any|undefined
}
