import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {BaseTreeItem} from './BaseTreeItem';
import {IotDevice} from './IotDevice';
import {IotResult,StatusResult } from './IotResult';

import {StringTrim} from './Helper/IoTHelper';
import { exit } from 'process';

export class IotDevicePackage extends BaseTreeItem {
  public Parent: IotDevice| IotDevicePackage;
  public Childs: Array<IotDevicePackage>=[];
  public Device: IotDevice;
  
  private _namePackage:TypePackage=TypePackage.none;  
  public get NamePackage(): TypePackage {
    return this._namePackage;}   
  public set NamePackage(newName: TypePackage) {
      this._namePackage=newName;
      //
      this.label=this._namePackage.toString();
      //this.description=this._versionPackage
      this.tooltip =`${this.label}-${this.description}`;
  }

  private _versionPackage:string|undefined;
  public get VersionPackage(): string|undefined {
    return this._versionPackage;}   
  public set VersionPackage(newVersion: string|undefined) {
      if(newVersion){
        this._versionPackage=newVersion;
        this.description=newVersion;
        this.isInstalled=true;       
      }else{
        this._versionPackage="not installed";
        this.description="not installed";
        this.isInstalled=false;
      }
      //
      this.tooltip =`${this.label} - ${this.description}`;
  }

  private _isInstalled:boolean=false;
  public get isInstalled(): boolean {
    return this._isInstalled;}   
  private set isInstalled(value: boolean) {
      this._isInstalled=value;
      //
      if(value)
      {
        this.iconPath = {
          light: path.join(__filename, '..', '..', 'resources', 'light', 'yes.svg'),
          dark: path.join(__filename, '..', '..', 'resources', 'dark', 'yes.svg')
        };
        //view
        this.contextValue="iotpackage_installed";
      }else
      {
        this.iconPath = {
          light: path.join(__filename, '..', '..', 'resources', 'light', 'no.svg'),
          dark: path.join(__filename, '..', '..', 'resources', 'dark', 'no.svg')
        };
        //view
        this.contextValue="iotpackages_not_installed";
      }      
  }

  constructor(            
    collapsibleState: vscode.TreeItemCollapsibleState,
    parent: IotDevice| IotDevicePackage,
    device: IotDevice
  ){
    super("label",undefined,undefined,collapsibleState);   
    this.Parent=parent;
    this.Device=device;
  };

  public InitRoot(
    label: string,
    description: string|  undefined,
    tooltip: string | vscode.MarkdownString | undefined
    )
  {
    this.label=label;
    this.description=description;
    this.tooltip=tooltip;
    //view
    this.contextValue="iotpackages";
  }

  public InitPackage(
    namePackage:TypePackage,
    version: string| undefined    
  )
  {
    this.NamePackage=namePackage;
    this.VersionPackage=version;   
  }

  public async Upgrade(objJSON:any): Promise<IotResult>{
    return await this.Install(objJSON);    
  }

  public async Uninstall(objJSON:any): Promise<IotResult>{           
    //Ping
    if(this.Device.Account.Host)
    {
      const result=await this.Client.Ping(this.Device.Account.Host);
      if(result.Status==StatusResult.Error) return Promise.resolve(result);  
    }    
    //
    //get namepackage 
    let namePackage = GetNamePackageByType(this.NamePackage);     
    //uninstallpackagedotnetsdk.sh
    let nameScript=`uninstallpackage${namePackage}`;
    //Params
    let paramsScript=this.GetParamsScript(this.NamePackage,objJSON);    
    //Exec
    let result = await this.Client.RunScript(this.Device.Account.SshConfig,undefined,this.Device.Config.PathFolderExtension,
      nameScript,paramsScript,false,false);    
    return Promise.resolve(result);    
  }
    
  public async Install(objJSON:any): Promise<IotResult>{        
    //Ping
    if(this.Device.Account.Host)
    {
      const result=await this.Client.Ping(this.Device.Account.Host);
      if(result.Status==StatusResult.Error) return Promise.resolve(result);  
    }    
    //get namepackage 
    let namePackage = GetNamePackageByType(this.NamePackage);     
    //installpackagedotnetsdk.sh
    let nameScript=`installpackage${namePackage}`;
    //Params
    let paramsScript=this.GetParamsScript(this.NamePackage,objJSON);    
    //Exec
    let result = await this.Client.RunScript(this.Device.Account.SshConfig,undefined,this.Device.Config.PathFolderExtension,
      nameScript,paramsScript, true,false);    
    return Promise.resolve(result); 
  }  

  public async Check(): Promise<IotResult>{    
    //get namepackage 
    let namePackage = GetNamePackageByType(this.NamePackage);    
    //checkpackagedotnetsdk.sh
    let nameScript=`checkpackage${namePackage}`;
    //Exec
    let result = await this.Client.RunScript(this.Device.Account.SshConfig,undefined,this.Device.Config.PathFolderExtension,
      nameScript,undefined, false,false); 
    if(result.Status==StatusResult.Ok)
    {
      if(StringTrim(<string>result.SystemMessage)=="notinstalled"){
        this.VersionPackage=undefined;
      }else
      {
        this.VersionPackage=StringTrim(<string>result.SystemMessage);
      }
    }
    return Promise.resolve(result); 
  }

  public async CheckAll(): Promise<void>{    
    //let result = new IotResult(StatusResult.None,undefined,undefined);
    this.Build();
    //
    let index:number=0;
    do{
      let item = this.Childs[index];
      if(item)
      {
        let result= await item.Check();        
        this.Client.FireChangedState({
          status: `Package check: ${item.NamePackage}`,
          console:result.SystemMessage,
          obj:result
        });        
      }else break;      
      index++;
    }while(true)    
  }

  public async Test(): Promise<IotResult>{  
    //Ping
    if(this.Device.Account.Host)
    {
      const result=await this.Client.Ping(this.Device.Account.Host);
      if(result.Status==StatusResult.Error) return Promise.resolve(result);  
    }
    //get namepackage 
    let namePackage = GetNamePackageByType(this.NamePackage);    
    //testpackagedotnetsdk.sh
    let nameScript=`testpackage${namePackage}`;
    //Exec
    let result = await this.Client.RunScript(this.Device.Account.SshConfig,undefined,this.Device.Config.PathFolderExtension,
      nameScript,undefined, false,false); 
    return Promise.resolve(result);
  }

  private CreateChildElements(    
    ){      
      //create child elements
      this.Childs=[];         
      let element = new IotDevicePackage(vscode.TreeItemCollapsibleState.None,this,this.Device);
      element.InitPackage(TypePackage.dotnetsdk,undefined);
      this.Childs.push(element);      
      element = new IotDevicePackage(vscode.TreeItemCollapsibleState.None,this,this.Device);
      element.InitPackage(TypePackage.dotnetruntimes,undefined);
      this.Childs.push(element);      
      element = new IotDevicePackage(vscode.TreeItemCollapsibleState.None,this,this.Device);
      element.InitPackage(TypePackage.debugger,undefined);
      this.Childs.push(element);      
      element = new IotDevicePackage(vscode.TreeItemCollapsibleState.None,this,this.Device);
      element.InitPackage(TypePackage.libgpiod,undefined);
      this.Childs.push(element);
      element = new IotDevicePackage(vscode.TreeItemCollapsibleState.None,this,this.Device);
      element.InitPackage(TypePackage.docker,undefined);
      this.Childs.push(element);
      //      
  }

  public Build(){   
    this.CreateChildElements();
  }

  public ToJSON():any{
     //Fill
     const json="{}";
     let jsonObj = JSON.parse(json); 
     //
     let keyItem="name";
     let valueItem=GetNamePackageByType(this.NamePackage);          
     jsonObj[keyItem]=valueItem;
     //
     keyItem="version";
     if(this.isInstalled)
     {
      valueItem=<string>this.VersionPackage;
     }else{
      valueItem=undefined;
     }
     jsonObj[keyItem]=valueItem;
     //          
     return jsonObj;    
  }
    
  public FromJSON(obj:any):any{      
    //Recovery package from JSON format
    if(obj[0]) this.Build(); else return;
    //
    let index=0;    
    do { 				
          let item=obj[index];
          if(item)
          {
            //Create packages            
            const namePackage=GetPackageByName(<string>item.name);
            const versionPackage=<string>item.version;
            let currentPackage=this.Childs.find(x=>x.NamePackage==namePackage);
            if(currentPackage)
            {
              currentPackage.VersionPackage=versionPackage;
            }
            //next position
            index=index+1;
          }else break;      
     } 
     while(true) 
  }

  public GetParamsScript(value:TypePackage,objJSON:any):string| undefined
  {
    //get params
    let params: string| undefined; 
    switch(value) { 
      case TypePackage.dotnetsdk: {
        params=`${objJSON.version} ${objJSON.installpath}`;
        break; 
      }
      case TypePackage.dotnetruntimes: { 
        params=`${objJSON.name} ${objJSON.version} ${objJSON.installpath}`;
        break; 
      }
      case TypePackage.debugger: { 
        params=`${objJSON.dotnetrid} ${objJSON.installpath}`;
        break; 
      }
      case TypePackage.libgpiod: { 
        params=`${objJSON.version} ${objJSON.installpath}`;
        break; 
      }
      case TypePackage.docker: { 
        params=`${objJSON.username}`;
        break; 
      }      
      default: { 
        params=undefined
        break;
      } 
    }
    //Trim
    if(params) params=StringTrim(params);
    return params;
  }

  iconPath? = {
    light: path.join(__filename, '..', '..', 'resources', 'light', 'package.svg'),
    dark: path.join(__filename, '..', '..', 'resources', 'dark', 'package.svg')
  };
    
}

export enum TypePackage {
  none = "None",
  dotnetsdk = ".NET SDK",
  dotnetruntimes = ".NET runtimes",
  debugger  = ".NET Debugger (vsdbg)",
  libgpiod = "Libgpiod",
  docker = "Docker"
}

export function GetNamePackageByType(value:TypePackage):string| undefined
  {
    //get namepackage
    let enumKeyTypePackage = Object.keys(TypePackage)[Object.values(TypePackage).indexOf(value)];
    return enumKeyTypePackage;

    //TODO: delete        
    /*
    let namepackage: string| undefined; 
    switch(value) { 
      case TypePackage.dotnetsdk: { 
        namepackage="dotnetsdk";
        break; 
      }
      case TypePackage.dotnetruntimes: { 
        namepackage="dotnetruntimes";
        break; 
      }
      case TypePackage.debugger: { 
        namepackage="debugger";
        break; 
      }
      case TypePackage.libgpiod: { 
        namepackage="libgpiod";
        break; 
      }
      case TypePackage.docker: { 
        namepackage="docker";
        break; 
      }      
      default: { 
        namepackage=undefined
        break; 
      } 
    }
    //
    return namepackage;
    */
  }

  export function GetPackageByName(value:string):TypePackage
  {
    //get typepackage 
    const enumValueExistence = Object.values(TypePackage)[Object.keys(TypePackage).indexOf(value)];
    return  <TypePackage>enumValueExistence;

    //TODO: delete
    /*
    let result:TypePackage;
    switch(value) { 
      case "dotnetsdk": { 
        result=TypePackage.dotnetsdk;
        break; 
      }
      case "dotnetruntimes": { 
        result=TypePackage.dotnetruntimes;
        break; 
      }
      case "debugger": { 
        result=TypePackage.debugger;
        break; 
      }
      case "libgpiod": { 
        result=TypePackage.libgpiod;
        break; 
      }
      case "docker": { 
        result=TypePackage.docker;
        break; 
      }      
      default: { 
        result=TypePackage.none;  
        break; 
      } 
    }
    //
    return result;
    */
  }
