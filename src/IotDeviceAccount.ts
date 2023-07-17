import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {BaseTreeItem} from './shared/BaseTreeItem';
import {IotDevice} from './IotDevice';
import {IotItemTree} from './shared/IotItemTree';
import {StatusResult,IotResult} from './IotResult';
import SSHConfig from 'ssh2-promise/lib/sshConfig';

export class IotDeviceAccount extends BaseTreeItem{  
  public Parent: IotDevice| undefined;
  public Childs: Array<BaseTreeItem| any>=[];;
  public Device: IotDevice;

  public Host: string| undefined;
  public Port: string| undefined;
  public UserName: string| undefined;
  public Identity: string| undefined;
  public Groups: Array<string>=[]; // $ groups debugvscode = debugvscode : debugvscode sudo docker

  public get PathKey(): string| undefined {
    return this.Device?.Config.Folder.KeysSbc +"\\"+this.Identity;}
    
  public get SshConfig(): SSHConfig {
    let port:number=0;
    if(this.Port) port=+this.Port;
    var sshconfig:SSHConfig  = {
      host: this.Host,
      port: port,
      username: this.UserName,
      identity: this.PathKey,
      readyTimeout: 7000
    };
    //setTimeout
    //readyTimeout: 7000
    //
    return sshconfig;    
    }

  /*
  private _host: string| undefined;
  private _port: string| undefined;
  private _userName: string| undefined;
  private _password: string| undefined;
  private _identity: string| undefined;
  private _groups: Array<string>=[]; // $ groups debugvscode = debugvscode : debugvscode sudo docker
  
  public get host(): string| undefined {
    return this._host;}
  
  public get port(): string| undefined {
    return this._port;}

  public get userName(): string| undefined {
    return this._userName;}

  public get password(): string| undefined {
    return this._password;}

  public get identity(): string| undefined {
    return this._identity;}

  public get groups(): Array<string> {
    return this._groups;}
  */

  constructor(
    label: string,
    description: string|  undefined,
    tooltip: string| vscode.MarkdownString| undefined,
    collapsibleState: vscode.TreeItemCollapsibleState,
    parent: IotDevice,
    device: IotDevice
  ){
    super(label,description,tooltip,collapsibleState);
    this.Parent=parent;
    this.Device=device;
  }

  

  public async Create(sshconfig:SSHConfig,accountNameDebug:string): Promise<IotResult>{
      //-------------------------------
      //create account
      let nameScript:string;
      let paramsScript:string;
      let result:IotResult;
      //base root
      nameScript="createaccountroot";
      paramsScript=`${this.Device.Config.Sbc.TypeKeySsh} ${this.Device.Config.Sbc.BitsKeySsh}`;
      //if debugvscode
      if(accountNameDebug!="root"){
        nameScript="createaccount";
        paramsScript=`${accountNameDebug} ${this.Device.Config.GroupAccountDevice_d} ${paramsScript}`;
      }
      //event
      this.Client.FireChangedState({
        status:undefined,
        console:`Run: ${nameScript}.sh ${paramsScript}`,
        obj:undefined
      });
      //run
      result = await this.Client.RunScript(sshconfig,undefined, this.Device.Config.Folder.Extension.fsPath,
        nameScript,paramsScript, false,false);
      //out
      if(result.SystemMessage){
            this.Client.FireChangedState({
               status:undefined,
               console:result.SystemMessage,
               obj:undefined
             });
         }   
      if(result.Status==StatusResult.Error) return Promise.resolve(result);  
      //-------------------------------            
      //get private file key
      let pathFile:string;
      if(accountNameDebug=="root"){
        pathFile=`/root/.ssh/id_${this.Device.Config.Sbc.TypeKeySsh}`;
      }else
      {
        pathFile=`/home/${accountNameDebug}/.ssh/id_${this.Device.Config.Sbc.TypeKeySsh}`;
      }      
      this.Client.FireChangedState({
        status:undefined,
        console:`Get file: ${pathFile}"`,
        obj:undefined
      }); 
      result = await this.Client.GetFile(sshconfig,undefined,pathFile,false);
      if(result.Status==StatusResult.Error) return Promise.resolve(result);
      //write file key in folder
      let data=result.SystemMessage;
      if(data)
      {
        const fileName=`id-${this.Device.Config.Sbc.TypeKeySsh}-${this.Device.IdDevice}-${accountNameDebug}`;
        pathFile=`${this.Device.Config.Folder.KeysSbc}\\${fileName}`;
        fs.writeFileSync(pathFile,data,undefined);
        //Attribute writing
        this.Host=sshconfig.host?.toString();
        this.Port=sshconfig.port?.toString();
        this.UserName=accountNameDebug;
        this.Identity=fileName;
        this.Groups.push(this.Device.Config.GroupAccountDevice_d);	        
      }
      //-------------------------------
      //udev rules
      if(accountNameDebug!="root"){
        paramsScript=accountNameDebug;
        this.Client.FireChangedState({
          status:undefined,
          console:`Run: addudevrules.sh ${paramsScript}"`,
          obj:undefined
        });         
        //put file 20-gpio-fastiot.rules in folder /etc/udev/rules.d
        //read file 20-gpio-fastiot.rules
        const nameFile = "20-gpio-fastiot.rules";
        const pathFileLocalRules= `${this.Device.Config.Folder.Extension}\\linux\\config\\${nameFile}`;
        if (!fs.existsSync(pathFileLocalRules))
        {
          return Promise.resolve(new IotResult(StatusResult.Error,`File not found! ${pathFileLocalRules}`,undefined));   
        }
        const dataFile:string= fs.readFileSync(pathFileLocalRules, 'utf8');	 
        //in Linux
        pathFile=`/etc/udev/rules.d/${nameFile}`;      
        this.Client.FireChangedState({
          status:undefined,
          console:`Put file: ${pathFile}"`,
          obj:undefined
        });      
        result = await this.Client.PutFile(sshconfig,undefined,pathFile,dataFile,"utf8",false);
        if(result.Status==StatusResult.Error) return Promise.resolve(result);            
        //add udev rules
        result = await this.Client.RunScript(sshconfig,undefined, this.Device.Config.Folder.Extension.fsPath,
            "addudevrules",paramsScript, false,false);
        if(result.SystemMessage){
              this.Client.FireChangedState({
                status:undefined,
                console:result.SystemMessage,
                obj:undefined
              });
          }   
        if(result.Status==StatusResult.Error) return Promise.resolve(result);
      }
      //-------------------------------
      //Change sshd_config
      /*
        PubkeyAuthentication yes
        ChallengeResponseAuthentication yes
        AuthenticationMethods publickey password
      */
      result = await this.Client.RunScript(sshconfig,undefined, this.Device.Config.Folder.Extension.fsPath,
          "changeconfigssh",undefined, false,false);
      if(result.SystemMessage){
            this.Client.FireChangedState({
              status:undefined,
              console:result.SystemMessage,
              obj:undefined
            });
        }   
      if(result.Status==StatusResult.Error) return Promise.resolve(result);
      //-------------------------------
      //create child elements
      await this.CreateChildElements();
      //
      this.collapsibleState=vscode.TreeItemCollapsibleState.Expanded;
      //
    return Promise.resolve(result);    
  }

  public async CreateChildElements(    
  ): Promise<void>{
    //create child elements
    this.Childs=[];         
    let element = new IotItemTree("Username",this.UserName,this.UserName,vscode.TreeItemCollapsibleState.None,this,this.Device);
    this.Childs.push(element);      
    let groups:string="";
    this.Groups.forEach(group =>
      {	
        groups=group+ " ";          
      });        
    element = new IotItemTree("Groups",groups,groups,vscode.TreeItemCollapsibleState.None,this,this.Device);
    this.Childs.push(element);
    element = new IotItemTree("SSH Key",this.Identity,`File ${this.PathKey}`,vscode.TreeItemCollapsibleState.None,this,this.Device);
    //Key availability check
    if(this.PathKey&&!fs.existsSync(this.PathKey)){
      //Not found
      const msg=`Error. SSH key not found: ${this.PathKey}. Device: ${this.Device.label}`;
      element.tooltip=msg;          
      element.iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'light', 'error.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'dark', 'error.svg')
      };
      //
      vscode.window.showErrorMessage(msg);
      this.collapsibleState=vscode.TreeItemCollapsibleState.Expanded;
    }
    this.Childs.push(element);
    if(this.PathKey&&fs.existsSync(this.PathKey)){
     const values=this.Identity?.split("-")??[];
     if (values.length>=2)
     {
      const value=values[1];
      element = new IotItemTree("SSH Key type",value,value,vscode.TreeItemCollapsibleState.None,this,this.Device);
      this.Childs.push(element);
     }
    }
    element = new IotItemTree("Host",this.Host,this.Host,vscode.TreeItemCollapsibleState.None,this,this.Device);
    this.Childs.push(element);
    element = new IotItemTree("Port",this.Port,this.Port,vscode.TreeItemCollapsibleState.None,this,this.Device);
    this.Childs.push(element);
  }
  
  /*
  iconPath = {
    light: path.join(__filename, '..', '..', 'resources', 'light', 'account.svg'),
    dark: path.join(__filename, '..', '..', 'resources', 'dark', 'account.svg')
  };
  */

  iconPath = new vscode.ThemeIcon("account");
  
}
