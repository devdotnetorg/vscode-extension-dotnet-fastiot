import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {BaseTreeItem} from './BaseTreeItem';
import {IotDevice} from './IotDevice';
import {IotItemTree} from './IotItemTree';
import {IotConfiguration} from './IotConfiguration';
import {StatusResult,IotResult} from './IotResult';
//

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
    return this.Device?.Config.AccountPathFolderKeys +"\\"+this.Identity;}
    
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
    tooltip: string|  undefined,
    collapsibleState: vscode.TreeItemCollapsibleState,
    parent: IotDevice,
    device: IotDevice
  ){
    super(label,description,tooltip,collapsibleState);
    this.Parent=parent;
    this.Device=device;
  }     

  public async Create(toHost: string, toPort: string,toUserName: string, toPassword: string,accountNameDebug:string,
    config:IotConfiguration,idDevice:string    
    ): Promise<IotResult>{             
      var sshconfig  = {
        host: toHost,
        port: toPort,
        username: toUserName,
        password: toPassword						
        };      
      //-------------------------------
      //create account
      let paramsScript:string;      
      let result:IotResult;
      //
      if(accountNameDebug=="root"){
        this.Client.FireChangedState({
          status:undefined,
          console:`Run: createaccountroot.sh`,
          obj:undefined
        });
        //
        result = await this.Client.RunScript(sshconfig,undefined, config.PathFolderExtension,
          "createaccountroot",undefined, false,false);
      }else
      {
        paramsScript=accountNameDebug+" "+config.AccountGroups;
        this.Client.FireChangedState({
          status:undefined,
          console:`Run: createaccount.sh ${paramsScript}"`,
          obj:undefined
        });
        //
        result = await this.Client.RunScript(sshconfig,undefined, config.PathFolderExtension,
          "createaccount",paramsScript, false,false);
      }
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
        pathFile=`/root/.ssh/id_rsa`;
      }else
      {
        pathFile=`/home/${accountNameDebug}/.ssh/id_rsa`;
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
        const fileName=`id-rsa-${idDevice}-${accountNameDebug}`;
        pathFile=`${config.AccountPathFolderKeys}\\${fileName}`;
        fs.writeFileSync(pathFile,data,undefined);
        //Attribute writing
        this.Host=toHost;
        this.Port=toPort;
        this.UserName=accountNameDebug;
        this.Identity=fileName;
        this.Groups.push(config.AccountGroups);	        
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
        const pathFileLocalRules= `${config.PathFolderExtension}\\vscodetemplates\\${nameFile}`;
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
        result = await this.Client.PutFile(sshconfig,undefined,pathFile,dataFile,false);
        if(result.Status==StatusResult.Error) return Promise.resolve(result);            
        //add udev rules
        result = await this.Client.RunScript(sshconfig,undefined, config.PathFolderExtension,
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
    if(this.PathKey)
    {
      if(!fs.existsSync(this.PathKey))
        {
          //Not found
          const msg=`Error. SSH key not found: ${this.PathKey}`;
          element.tooltip=msg;          
          element.iconPath = {
            light: path.join(__filename, '..', '..', 'resources', 'light', 'error.svg'),
            dark: path.join(__filename, '..', '..', 'resources', 'dark', 'error.svg')
          };
          //
          vscode.window.showErrorMessage(msg);
          this.collapsibleState=vscode.TreeItemCollapsibleState.Expanded; 
        }
    }
    this.Childs.push(element);
    element = new IotItemTree("Host",this.Host,this.Host,vscode.TreeItemCollapsibleState.None,this,this.Device);
    this.Childs.push(element);
    element = new IotItemTree("Port",this.Port,this.Port,vscode.TreeItemCollapsibleState.None,this,this.Device);
    this.Childs.push(element);
  }
  iconPath = {
    light: path.join(__filename, '..', '..', 'resources', 'light', 'account.svg'),
    dark: path.join(__filename, '..', '..', 'resources', 'dark', 'account.svg')
  };
  
}
