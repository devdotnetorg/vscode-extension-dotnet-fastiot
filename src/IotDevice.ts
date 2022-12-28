import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {BaseTreeItem} from './BaseTreeItem';
import {IotDeviceAccount} from './IotDeviceAccount';
import {IotDeviceInformation, Existences} from './IotDeviceInformation';
import {TypePackage,IotDevicePackage} from './IotDevicePackage';
import {IotConfiguration } from './IotConfiguration';
import {IotResult,StatusResult } from './IotResult';
import {v4 as uuidv4} from 'uuid';
import {IotItemTree } from './IotItemTree';
import { config } from 'process';
import SSH2Promise from 'ssh2-promise';
import {IotDeviceDTO } from './IotDeviceDTO';
import {IotDeviceGpiochip } from './IotDeviceGpiochip';
import SSHConfig from 'ssh2-promise/lib/sshConfig';
import { strictEqual } from 'assert';
//

export class IotDevice extends BaseTreeItem {    
  public IdDevice:string|undefined;

  public Parent: undefined;
  public Childs: Array<IotDeviceAccount| IotDeviceInformation| IotDevicePackage| IotDeviceDTO| IotDeviceGpiochip>=[];
  public Device: IotDevice=this;

  public Config:IotConfiguration  
  
  public Account: IotDeviceAccount;
  public Information: IotDeviceInformation;  
  public PackagesLinux: IotDevicePackage;
  public DtoLinux:IotDeviceDTO;
  public GpioChips:IotDeviceGpiochip;

  //Format Version for export to json
  private _formatVersion: number=1;  

  constructor(config:IotConfiguration
    ){
      super("device","description", undefined,vscode.TreeItemCollapsibleState.Expanded);
      this.Config=config;
      //const guid = uuidv4();
      //this.idDevice=guid.substr(0,8);
      //view
      this.contextValue="iotdevice";
      //
      let tooltip = new vscode.MarkdownString(`Ssh connection parameters Ssh  \nsuch as host, port, username, key`, true);
      this.Account = new IotDeviceAccount("Connection",undefined,tooltip,
        vscode.TreeItemCollapsibleState.Collapsed,this,this);
      this.Information = new IotDeviceInformation("Information",undefined,"Device info",
        vscode.TreeItemCollapsibleState.Collapsed,this,this);               
      this.PackagesLinux = new IotDevicePackage(vscode.TreeItemCollapsibleState.Collapsed,this,this);
      this.PackagesLinux.InitRoot("Packages",undefined,"Installed packages");      
      this.DtoLinux=new IotDeviceDTO(vscode.TreeItemCollapsibleState.Collapsed,this,this);
      this.DtoLinux.InitRoot("Device Tree Overlays",undefined,"This is data structure describing a system's hardware",
        vscode.TreeItemCollapsibleState.Collapsed);
      this.GpioChips=new IotDeviceGpiochip(vscode.TreeItemCollapsibleState.Collapsed,this,this);
      tooltip = new vscode.MarkdownString(`Working with GPIO controllers (gpiochip) using the Libgpiod library (by Bartosz Golaszewski).  \n`+
        `Library source code [libgpiod/libgpiod.git](https://git.kernel.org/pub/scm/libs/libgpiod/libgpiod.git "C library and tools for interacting with the linux GPIO character device")  \n`
        , true);
      this.GpioChips.InitRoot("GPIO (gpiochips)", undefined, tooltip, vscode.TreeItemCollapsibleState.Collapsed);
      //Update info element
      this.Account.Device=this;
      this.Information.Device=this;
      this.PackagesLinux.Device=this;        
      //Added in childs
      this.Childs.push(this.Account);
      this.Childs.push(this.Information);
      this.Childs.push(this.PackagesLinux);
      this.Childs.push(this.DtoLinux);
      this.Childs.push(this.GpioChips);
    }
  
  public async Create(
    host: string, port: string,userName: string, password: string, accountNameDebug:string,
    config:IotConfiguration            
  ): Promise<IotResult>{    
    //--------------------------------------
    //get Information
    this.Client.FireChangedState({
      status:"Create a device: Step 1 of 2. Retrieving Device Information.",
      console:undefined,
      obj:undefined
    });
    //event subscription
    let handler=this.Information.Client.OnChangedStateSubscribe(event => {              
      if(event.console){
        this.Client.FireChangedState({
          status:undefined,
          console:event.console,
          obj:undefined
        });
      }       
    });
    //create connection info    
    var sshconfig  = {
      host: host,
      port: port,
      username: userName,
      password: password,
      tryKeyboard: true,
			readyTimeout: 7000
      };          
    //
    let result=await this.Information.Get(sshconfig,config);
    //event unsubscription    
    this.Information.Client.OnChangedStateUnsubscribe(handler);
    //    
    if(result.Status==StatusResult.Error) return Promise.resolve(result);    
    //Generating ID Device
    const guid = uuidv4();
		this.IdDevice=this.Information.Hostname+"-"+guid.substr(0,8);
    //Add child: Id device
    this.AddidDeviceInChildsInformation();
    //--------------------------------------
    //Account creation
    this.Client.FireChangedState({
      status:"Create a device: Step 2 of 2. Account creation.",
      console:undefined,
      obj:undefined
    });    
    //event subscription
    handler=this.Account.Client.OnChangedStateSubscribe(event => {              
      if(event.console)
      {
        this.Client.FireChangedState({
          status:undefined,
          console:event.console,
          obj:undefined
        });
      }
    });    
    result=await this.Account.Create(sshconfig,accountNameDebug,config,this.IdDevice);
    //event unsubscription    
    this.Account.Client.OnChangedStateUnsubscribe(handler);
    //
    if(result.Status==StatusResult.Error) return Promise.resolve(result);
    //--------------------------------------
    //set info
    this.label=this.Information.Hostname;
    this.description = this.Information.Architecture;
    this.tooltip= this.Information.BoardName +" " + this.Information.Architecture;
    //Expanded All Root elements
    this.Account.collapsibleState=vscode.TreeItemCollapsibleState.Expanded;
    this.Information.collapsibleState=vscode.TreeItemCollapsibleState.Expanded;
    this.PackagesLinux.collapsibleState=vscode.TreeItemCollapsibleState.Expanded;
    //
    return Promise.resolve(result);   
  }

  private AddidDeviceInChildsInformation():void
  {
    //Add child: Id device
    let elementIdDevice = new IotItemTree("Id device",this.IdDevice,this.IdDevice,vscode.TreeItemCollapsibleState.None,this.Information,this);
    this.Information.Childs.unshift(elementIdDevice);
  }

  //async getJSON(): Promise<any>{
  public ToJSON():any{
    //==========================
    let jsonObj = {
        formatVersion: 0,
        existence: "",

        idDevice:"",        
        label:"",
        description:"",
        tooltip:"",
        collapsibleState:0,

        IotDeviceAccount:{          
          collapsibleState:0,

          host: "",
          port: "",
          userName: "",
          identity: "",
          groups: []
        },
        IotDeviceInformation:{          
          collapsibleState:0,

          hostname:"",
          architecture:"",
          osKernel:"",
          osName:"",
          osDescription:"",
          osRelease:"",
          osCodename:"",
          boardName:"",
          boardFamily:"",
          armbianVersion:"",
          linuxFamily:""
        },
        IotPackages:[],
        IotDTO:{},
        IotGpiochips:[]
    };
    //==========================
    //Fill
    //IotDevice
    jsonObj.formatVersion=<number>this._formatVersion; //Format Version JSON
    //Categories of existence
    const enumKeyExistence = Object.keys(Existences)[Object.values(Existences).indexOf(this.Information.Existence)];
    jsonObj.existence=<string>enumKeyExistence;    
    //
    jsonObj.idDevice=<string>this.IdDevice;
    jsonObj.label=<string>this.label;
    jsonObj.description=<string>this.description;
    jsonObj.tooltip=<string>this.tooltip;
    jsonObj.collapsibleState=<number>this.collapsibleState;
 
    //IotDeviceAccount    
    jsonObj.IotDeviceAccount.collapsibleState=<number>this.Account.collapsibleState;
    jsonObj.IotDeviceAccount.host=<string>this.Account.Host;
    jsonObj.IotDeviceAccount.port=<string>this.Account.Port;
    jsonObj.IotDeviceAccount.userName=<string>this.Account.UserName;
    jsonObj.IotDeviceAccount.identity=<string>this.Account.Identity;   
    //groups
    this.Account.Groups.forEach(group =>
      {	                
        jsonObj.IotDeviceAccount.groups.push(<never>group);
      });               
    //IotDeviceInformation    
    jsonObj.IotDeviceInformation.collapsibleState=<number>this.Information.collapsibleState;
    
    jsonObj.IotDeviceInformation.hostname=<string>this.Information.Hostname;
    jsonObj.IotDeviceInformation.architecture=<string>this.Information.Architecture;
    jsonObj.IotDeviceInformation.osKernel=<string>this.Information.OsKernel;
    jsonObj.IotDeviceInformation.osName=<string>this.Information.OsName;
    jsonObj.IotDeviceInformation.osDescription=<string>this.Information.OsDescription;
    jsonObj.IotDeviceInformation.osRelease=<string>this.Information.OsRelease;
    jsonObj.IotDeviceInformation.osCodename=<string>this.Information.OsCodename;
    jsonObj.IotDeviceInformation.boardName=<string>this.Information.BoardName;
    jsonObj.IotDeviceInformation.boardFamily=<string>this.Information.BoardFamily;
    jsonObj.IotDeviceInformation.armbianVersion=<string>this.Information.ArmbianVersion;
    jsonObj.IotDeviceInformation.linuxFamily=<string>this.Information.LinuxFamily;
    //IotPackage
    this.PackagesLinux.Childs.forEach(item =>
      {	                
        jsonObj.IotPackages.push(<never>item.ToJSON());
      });
    //DTO
    jsonObj.IotDTO=this.DtoLinux.ToJSON();
    //Gpiochips
    jsonObj.IotGpiochips=this.GpioChips.ToJSON();
    //
    return jsonObj;    
  }

  public FromJSON(obj:any):any{    
    //Recovery device from JSON format     
    //IotDevice
    this._formatVersion=<number>obj.formatVersion; //Format Version JSON    
    //Categories of existence    
    const enumValueExistence = Object.values(Existences)[Object.keys(Existences).indexOf(obj.existence)];
    this.Information.Existence=<Existences>enumValueExistence;
    //
    this.IdDevice=<string>obj.idDevice;
    this.label=<string>obj.label;
    this.description=<string>obj.description;
    this.tooltip=<string>obj.tooltip;    
    //IotDeviceAccount
    this.Account.Host=<string>obj.IotDeviceAccount.host;
    this.Account.Port=<string>obj.IotDeviceAccount.port;
    this.Account.UserName=<string>obj.IotDeviceAccount.userName;
    this.Account.Identity=<string>obj.IotDeviceAccount.identity;
    //groups
    let index=0;    
    do { 				
          let group=obj.IotDeviceAccount.groups[index];
          if(group)
          {
            this.Account.Groups.push(<string>group);            
            //next position
            index=index+1;
          }else break;      
     } 
     while(true)
    //restory child elements
    this.Account.CreateChildElements();
    //IotDeviceInformation
    this.Information.Hostname = <string>obj.IotDeviceInformation.hostname;
    this.Information.Architecture = <string>obj.IotDeviceInformation.architecture;
    this.Information.OsKernel = <string>obj.IotDeviceInformation.osKernel;
    this.Information.OsName = <string>obj.IotDeviceInformation.osName;
    this.Information.OsDescription = <string>obj.IotDeviceInformation.osDescription;
    this.Information.OsRelease = <string>obj.IotDeviceInformation.osRelease;
    this.Information.OsCodename = <string>obj.IotDeviceInformation.osCodename;
    this.Information.BoardName = <string>obj.IotDeviceInformation.boardName;
    this.Information.BoardFamily = <string>obj.IotDeviceInformation.boardFamily;
    this.Information.ArmbianVersion = <string>obj.IotDeviceInformation.armbianVersion;
    this.Information.LinuxFamily = <string>obj.IotDeviceInformation.linuxFamily;
    //restory child elements
    this.Information.CreateChildElements();
    //Add child: Id device
    this.AddidDeviceInChildsInformation();
    //IotPackages  
    this.PackagesLinux.FromJSON(obj.IotPackages);    
    //DTO
    this.DtoLinux.FromJSON(obj.IotDTO);
    //Gpiochips
    this.GpioChips.FromJSON(obj.IotGpiochips)
  }

  public async Ping(): Promise<IotResult>{ 
    //Ping
    if(this.Device.Account.Host)
    {
      const result=await this.Client.Ping(this.Device.Account.Host);
      if(result.Status==StatusResult.Error) return Promise.resolve(result);  
    }    
    //   
    let ssh = new SSH2Promise(this.Account.SshConfig,undefined);
    try
      {
        await ssh.connect();
        console.log("Connection established SSH");
      }
    catch (err)
      {
        console.log("Not Connected SSH");
        return Promise.resolve(new IotResult(StatusResult.Error,"Not Connected SSH!",undefined));
      }
    ssh.close();
    return Promise.resolve(new IotResult(StatusResult.Ok,"Connected SSH!",undefined));          
  }

  public async Reboot(): Promise<IotResult>{
    //Ping
    if(this.Device.Account.Host)
    {
      const result=await this.Client.Ping(this.Device.Account.Host);
      if(result.Status==StatusResult.Error) return Promise.resolve(result);  
    }    
    //
    const result=await this.Client.RunScript(this.Device.Account.SshConfig,undefined,this.Config.Folder.Extension,"reboot",
      undefined,false,false);
    //if(result.status==StatusResult.Error) return Promise.resolve(result);
    
    return Promise.resolve(result);    
  }

  public async Shutdown(): Promise<IotResult>{
    //Ping
    if(this.Device.Account.Host)
    {
      const result=await this.Client.Ping(this.Device.Account.Host);
      if(result.Status==StatusResult.Error) return Promise.resolve(result);  
    }    
    //
    const result=await this.Client.RunScript(this.Device.Account.SshConfig,undefined,this.Config.Folder.Extension,"shutdown",
      undefined,false,false);    
    return Promise.resolve(result);    
  }

  public async Refresh(): Promise<void> {    
    this.Account.Childs=[];
    await this.Account.CreateChildElements();
    this.Information.Childs=[];
    await this.Information.CreateChildElements();
    //Add idDevice
    this.AddidDeviceInChildsInformation();  
  }

  iconPath = {
    light: path.join(__filename, '..', '..', 'resources', 'light', 'device.svg'),
    dark: path.join(__filename, '..', '..', 'resources', 'dark', 'device.svg')
  };
}


