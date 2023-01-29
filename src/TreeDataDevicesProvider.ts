import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {BaseTreeItem} from './BaseTreeItem';
import {IChangedStateEvent} from './SshClient';

import { IotDevice } from './IotDevice';
import { IotDeviceAccount } from './IotDeviceAccount';
import { IotDeviceInformation } from './IotDeviceInformation';
import { IotItemTree } from './IotItemTree';
import { IotDevicePackage,TypePackage } from './IotDevicePackage';
import { IotDeviceDTO } from './IotDeviceDTO';

import {IoTHelper} from './Helper/IoTHelper';

import { IotResult,StatusResult } from './IotResult';
import {IotConfiguration} from './Configuration/IotConfiguration';
import {EventDispatcher,Handler} from './EventDispatcher';

export class TreeDataDevicesProvider implements vscode.TreeDataProvider<BaseTreeItem> {    
  public RootItems:Array<IotDevice>=[];

  private _isStopStatusBar:boolean=true;
  private _statusBarText:string="";

  private _config:IotConfiguration
  public get Config(): IotConfiguration {
    return this._config;}

  public set Config(newConfig:IotConfiguration){
    this._config=newConfig;    
    //devices
    this.RootItems.forEach(item =>
      {	                
        item.Config=newConfig;        
      });
    //
    this.RefreshsFull();
  }

  private _onDidChangeTreeData: vscode.EventEmitter<BaseTreeItem| undefined | null | void> = 
    new vscode.EventEmitter<BaseTreeItem| undefined | null | void>();
  public readonly onDidChangeTreeData: vscode.Event<BaseTreeItem| undefined | null | void> = 
    this._onDidChangeTreeData.event;
  
  public OutputChannel:vscode.OutputChannel;
  private _statusBarItem:vscode.StatusBarItem;
  public SaveDevicesCallback:(data:any) =>void;
    
  constructor(
    outputChannel:vscode.OutputChannel,
    statusBarItem:vscode.StatusBarItem,
    saveDevicesCallback:(data:any) =>void,
    config:IotConfiguration,    
    jsonDevices:any
  ) {     
      this.OutputChannel=outputChannel;
      this._statusBarItem=statusBarItem;
      this.SaveDevicesCallback=saveDevicesCallback;
      //Set config
      this._config=config;
      //Recovery devices
      if(jsonDevices.IotDevices) this.RecoveryDevices(jsonDevices);
  }

  public getTreeItem(element: BaseTreeItem): vscode.TreeItem | Thenable<BaseTreeItem> {
    return element;
  }  
  
  public getChildren(element?: BaseTreeItem): Thenable<BaseTreeItem[]> {
    if (element) {
      //Creating a child element
      let objArray: Array<BaseTreeItem> =[];
      element.Childs.forEach(child =>
        {	
          objArray.push(child)
        });     
      return Promise.resolve(objArray);
    }else
    {
      //Creating a root structure            
      return Promise.resolve(this.RootItems);        
    }    
  }

  public getParent(element: BaseTreeItem): BaseTreeItem| undefined {
    return element.Parent    
  } 

  public Refresh(): void {        
    this._onDidChangeTreeData.fire();    
  }

  public RefreshsFull(): void {    
    this.RootItems.forEach(item =>
      {	                
        item.Refresh();        
      }); 
    //
    this._onDidChangeTreeData.fire();    
  }

  //------------ Base ------------
  public GetUniqueLabel(newlabel:string,suffix:string, increment:number|undefined): string{
    let checklabel=newlabel;
    if(increment) checklabel=`${newlabel} ${suffix}${increment}`;    
    const item = this.RootItems.find(x=>x.label==checklabel);
    if(item)
    {
      if(!increment) increment=0; 
      increment++;      
      checklabel= this.GetUniqueLabel(newlabel,suffix,increment);
    }
    return checklabel;   
  }

  private async SetTextStatusBar(textStatusBar:string): Promise<void>{
    if(this._statusBarItem)
    {
      this._statusBarText=textStatusBar;      
    }    
  }

  private async ShowStatusBar(textStatusBar:string): Promise<void>{    
    if(this._statusBarItem)
      {
        if(!this._isStopStatusBar)
        {
          this.SetTextStatusBar(textStatusBar);
          return;
        }
        //
        this._isStopStatusBar=false;
        this.SetTextStatusBar(textStatusBar);
        //        
        this._statusBarItem.text=this._statusBarText;      
        this._statusBarItem.tooltip=this._statusBarText;
        this._statusBarItem.show();
        let progressChars: string = '|/-\\';
        let lengthProgressChars = progressChars.length;
        let posProgressChars:number=0;
        
          do { 				
            let chars = progressChars.charAt(posProgressChars);
            this._statusBarItem.text = chars + " " + this._statusBarText;
            this._statusBarItem.tooltip=this._statusBarText;
            posProgressChars=posProgressChars+1;
            if(posProgressChars>lengthProgressChars) posProgressChars=0; 
            await IoTHelper.Sleep(150);
           } 
           while(!this._isStopStatusBar)
      }    
    }

  private async HideStatusBar(): Promise<void>{
    if(this._statusBarItem)
    {
      this._isStopStatusBar=true;						
      this._statusBarItem.hide();						
    }    
  }

  public ToJSON():any{
    //save JSON
    let jsonObj = {
      IotDevices:[]      
    }
    //foreach
    this.RootItems.forEach(device => {
      const value=device.ToJSON();
      jsonObj.IotDevices.push(<never>value);
    });
    //
    return jsonObj;
  }

  public FromJSON(jsonObj:any):Promise<IotResult>{
    try
    {
      //Recovery devices from JSON format        
      let index=0;    
      let importedDevices=0;
      do { 				
            let jsonDevice=jsonObj.IotDevices[index];
            if(jsonDevice)
            {
              //parse
              let device = new IotDevice(this.Config);
              device.collapsibleState=vscode.TreeItemCollapsibleState.Collapsed;
              device.FromJSON(jsonDevice);              
              if(device.IdDevice){
                const findDevice= this.FindbyIdDevice(device.IdDevice);
                if(!findDevice){
                  //checking the uniqueness of the device name
                  //Rename. checking for matching names.
                  device.label= this.GetUniqueLabel(<string>device.label,'#',undefined);
                  //
                  this.RootItems.push(device);
                  importedDevices++;
                }
              }              
              //next position
              index=index+1;
            }else break;      
      } 
      while(true)
      //
      return Promise.resolve(new IotResult(StatusResult.Ok,`Imported ${importedDevices} of ${index} devices.`,undefined));
    }
    catch (err:any)
    {        
        return Promise.resolve(new IotResult(StatusResult.Error,`Error parsing JSON file `,err));
    }    
  }

  //------------ Devices ------------
  public async AddDevice(toHost: string,toPort: string,toUserName: string,toPassword: string,accountNameDebug:string): Promise<IotResult> {         
      let device = new IotDevice(this.Config);
      //Ping
      let result=await device.Client.Ping(toHost);
      if(result.Status==StatusResult.Error) return Promise.resolve(result);  
      //
      this.ShowStatusBar("Create a device");
      this.OutputChannel.appendLine("Create a device");
      //event subscription
      let handler=device.Client.OnChangedStateSubscribe(event => {        
        if(event.status) this.SetTextStatusBar(event.status);
        if(event.status) this.OutputChannel.appendLine(event.status);
        if(event.console) this.OutputChannel.appendLine(event.console); 
      });
      result = await device.Create(toHost,toPort,toUserName, toPassword,accountNameDebug);
      if(result.Status==StatusResult.Error)
      {
        this.HideStatusBar();
        return Promise.resolve(result);
      }
      //Rename. checking for matching names.
      device.label= this.GetUniqueLabel(<string>device.label,'#',undefined);      
      //
      this.RootItems.push(device);
      //save in config      
      this.SaveDevices()
      //Refresh treeView
      this.Refresh();
      //return new device
      result.returnObject=device;
      //event unsubscription    
      device.Client.OnChangedStateUnsubscribe(handler);
      this.HideStatusBar();
      //
      return Promise.resolve(result);   
  }

  public async SaveDevices(): Promise<void> {
    const jsonObj = this.ToJSON();
    this.SaveDevicesCallback(jsonObj);     
  }      
  
  private async RecoveryDevices(jsonObj:any): Promise<void>{    
    //Recovery devices from config in JSON format
    this.ShowStatusBar("Reading extension settings");    
    this.RootItems=[];
    await this.FromJSON(jsonObj);
    //Refresh treeView
    this.Refresh();
    //end processing
    this.HideStatusBar();
  }

  public FindbyIdDevice(idDevice:string): IotDevice|undefined {
    let device = this.RootItems.find(x=>x.IdDevice==idDevice);
    return device;
  }  

  public async RenameDevice(item:IotDevice,newLabel:string): Promise<boolean> {
    if(this.RootItems.find(x=>x.label==newLabel)) return Promise.resolve(false);     
    let device = this.FindbyIdDevice(<string>item.IdDevice);
    if(device){
      device.label=newLabel;
      return Promise.resolve(true);   
    }
    return Promise.resolve(false);   
  }  

  public async DeleteDevice(idDevice:string): Promise<boolean> {        
    let device = this.FindbyIdDevice(idDevice);    
    if(device){
      const index=this.RootItems.indexOf(device);
      this.RootItems.splice(index,1);
      /*
      //delete file key
      const pathKey=<string>device.Account.PathKey;
      if (fs.existsSync(pathKey)) {
        //File exists in path
        fs.rmSync(pathKey);
      } 
      */     
      //
      return Promise.resolve(true);   
    }
    return Promise.resolve(false);   
  } 

  //------------ Packages ------------
  public async CheckAllPackages(idDevice:string):  Promise<IotResult> {    
    let device = this.FindbyIdDevice(idDevice);
    let result = new IotResult(StatusResult.None,undefined,undefined);    
    if(device){      
      //Ping
      if(device.Account.Host)
        {
          const result=await device.Client.Ping(device.Account.Host);
          if(result.Status==StatusResult.Error) return Promise.resolve(result);  
        }
    this.ShowStatusBar("Checking for packages");    
      //event subscription
      let handler=device.PackagesLinux.Client.OnChangedStateSubscribe(event => {
        //output
        if(event.status) this.OutputChannel.appendLine(event.status);
        if(event.console) this.OutputChannel.appendLine(event.console);
        //IotResult
        if(event.obj) result=<IotResult>event.obj;                
      });
      //CheckAll
      await device.PackagesLinux.CheckAll(); 
      //event unsubscription    
      //device.Client.OnChangedStateUnsubscribe(handler);  
      device.PackagesLinux.Client.OnChangedStateUnsubscribe(handler);
      //Expanded node
      //device.PackagesLinux.collapsibleState=vscode.TreeItemCollapsibleState.Expanded;
      this.Refresh();    
      this.HideStatusBar();
      this.SaveDevices();
    }    
    //    
    return Promise.resolve(result); 
  }

  public async InstallPackage(idDevice:string,itemPackage:TypePackage,objJSON:any): Promise<IotResult> {             
    this.ShowStatusBar(`Package install/upgrade: ${itemPackage}`);
    this.OutputChannel.appendLine(`Package install/upgrade:${itemPackage}`);
    //
    let device= this.FindbyIdDevice(idDevice);
    let result=new IotResult(StatusResult.None,"message", undefined);
    if(!device){
      result=new IotResult(StatusResult.Error,"Device not found", undefined);
      this.HideStatusBar();
      return Promise.resolve(result);
    }     
    let devicePackage=device.PackagesLinux.Childs.find(x=>x.NamePackage==itemPackage);
    if(!devicePackage)
    {
      result=new IotResult(StatusResult.Error,"Package not found", undefined);
      this.HideStatusBar();
      return Promise.resolve(result);
    }
    //event subscription    
    let handler=devicePackage.Client.OnChangedStateSubscribe(event => {
      if(event.console) this.OutputChannel.appendLine(event.console);
    });
    //Upgrade
    result = await devicePackage.Install(objJSON);
    //Check
    if(StatusResult.Ok==result.Status){
      await devicePackage.Check();
      //Check .NET runtime
      if (devicePackage.NamePackage==TypePackage.dotnetsdk)
      {
        let netruntimePackage = devicePackage.Device.PackagesLinux.Childs
          .find(x=>x.NamePackage==TypePackage.dotnetruntimes);
        if(netruntimePackage){
          await netruntimePackage.Check();
        }
      }
      //Refresh treeView
      this.Refresh();
      //save in config
      this.SaveDevices()      
    } 
    //event unsubscription    
    devicePackage.Client.OnChangedStateUnsubscribe(handler);
    this.HideStatusBar();
    //
    return Promise.resolve(result);
  }

  public async UpgradePackage(itemPackage:TypePackage,idDevice:string,objJSON:any): Promise<IotResult> {
    return await this.InstallPackage(idDevice,itemPackage,objJSON);      
  }

  public async UnInstallPackage(idDevice:string,itemPackage:TypePackage,objJSON:any): Promise<IotResult> {             
    this.ShowStatusBar(`Package uninstall: ${itemPackage}`);
    this.OutputChannel.appendLine(`Package uninstall:${itemPackage}`);
    //
    let device= this.FindbyIdDevice(idDevice);
    let result=new IotResult(StatusResult.None,"message", undefined);
    if(!device){
      result=new IotResult(StatusResult.Error,"Device not found", undefined);
      this.HideStatusBar();
      return Promise.resolve(result);
    }     
    let devicePackage=device.PackagesLinux.Childs.find(x=>x.NamePackage==itemPackage);
    if(!devicePackage)
    {
      result=new IotResult(StatusResult.Error,"Package not found", undefined);
      this.HideStatusBar();
      return Promise.resolve(result);
    }    
    //Uninstall
    result = await devicePackage.Uninstall(objJSON);
    //Check
    if(StatusResult.Ok==result.Status){
      await devicePackage.Check();
      //Check .NET runtime
      if (devicePackage.NamePackage==TypePackage.dotnetsdk)
      {
        let netruntimePackage = devicePackage.Device.PackagesLinux.Childs
          .find(x=>x.NamePackage==TypePackage.dotnetruntimes);
        if(netruntimePackage){
          await netruntimePackage.Check();
        }
      }
      if (devicePackage.NamePackage==TypePackage.dotnetruntimes)
      {
        let netsdkPackage = devicePackage.Device.PackagesLinux.Childs
          .find(x=>x.NamePackage==TypePackage.dotnetsdk);
        if(netsdkPackage){
          await netsdkPackage.Check();
        }
      }
      //Refresh treeView
      this.Refresh();
      //save in config
      this.SaveDevices()      
    } 
    this.HideStatusBar();
    //
    return Promise.resolve(result);
  }

  public async TestPackage(idDevice:string,itemPackage:TypePackage): Promise<IotResult> {    
    this.ShowStatusBar(`Package test: ${itemPackage}`);
    this.OutputChannel.appendLine(`Package test:${itemPackage}`);
    //
    let device= this.FindbyIdDevice(idDevice);
    let result=new IotResult(StatusResult.None,"message", undefined);
    if(!device){
      result=new IotResult(StatusResult.Error,"Device not found", undefined);
      this.HideStatusBar();
      return Promise.resolve(result);
    }     
    let devicePackage=device.PackagesLinux.Childs.find(x=>x.NamePackage==itemPackage);
    if(!devicePackage)
    {
      result=new IotResult(StatusResult.Error,"Package not found", undefined);
      this.HideStatusBar();
      return Promise.resolve(result);
    }    
    //Test
    result = await devicePackage.Test();    
    this.HideStatusBar();
    //
    return Promise.resolve(result);
  }

  //------------ Gpiochips ------------
  public async DetectGpiochips(idDevice:string):  Promise<IotResult> {
    this.ShowStatusBar("Detecting all GPIO chips");
    let device = this.FindbyIdDevice(idDevice);
    let result = new IotResult(StatusResult.None,undefined,undefined);
    if(device)
    {
      //Ping
      if(device.Account.Host)
      {
        const result=await device.Client.Ping(device.Account.Host);
        if(result.Status==StatusResult.Error) return Promise.resolve(result);  
      }    
      //
      result= await device.GpioChips.Detect();
      if(result.Status==StatusResult.Ok)
      {
        this.Refresh();
        this.SaveDevices();
      }
    }else
    {
      result=new IotResult(StatusResult.Error,"Device not found.",undefined)
    }
    //
    this.HideStatusBar(); 
    return Promise.resolve(result); 
  }

  //------------ DTOs ------------
  public async GetAllDTO(idDevice:string): Promise<IotResult> {
    this.ShowStatusBar("Retrieving all DTOs");
    let device = this.FindbyIdDevice(idDevice);
    let result = new IotResult(StatusResult.None,undefined,undefined);
    if(device)
    {
      result= await device.DtoLinux.GetAll();      
      if(result.Status==StatusResult.Ok)
      {
        this.Refresh();
        this.SaveDevices();
      }
    }else
    {
      result=new IotResult(StatusResult.Error,"Device not found.",undefined)
    }
    //
    this.HideStatusBar(); 
    return Promise.resolve(result); 
  }

  public async AddDTO(idDevice:string, fileName:string, fileData:string,fileType:string):  Promise<IotResult> {
    this.ShowStatusBar("Adding a DTO");
    let device = this.FindbyIdDevice(idDevice);
    let result = new IotResult(StatusResult.None,undefined,undefined);
    if(device)
    {
      result= await device.DtoLinux.Put(fileName,fileData,fileType);
      if(result.Status==StatusResult.Error)
      {
        this.HideStatusBar(); 
        return Promise.resolve(result);
      } 
      result= await device.DtoLinux.GetAll();
      if(result.Status==StatusResult.Ok)
      {
        this.Refresh();
        this.SaveDevices();
      }
    }else
    {
      result=new IotResult(StatusResult.Error,"Device not found.",undefined)
    }
    //
    this.HideStatusBar(); 
    return Promise.resolve(result); 
  }

  public async DeleteDTO(itemDTO:IotDeviceDTO):  Promise<IotResult> {
    this.ShowStatusBar("DTO removal");
    let result = await itemDTO.Delete()
    if(result.Status==StatusResult.Error)
    {
      this.HideStatusBar(); 
      return Promise.resolve(result);
    }
    result= await itemDTO.Device.DtoLinux.GetAll();
    if(result.Status==StatusResult.Ok)
    {
      this.Refresh();
      this.SaveDevices();
    }
    //
    this.HideStatusBar(); 
    return Promise.resolve(result); 
  }

  public async EnableDTO(itemDTO:IotDeviceDTO):  Promise<IotResult> {
    this.ShowStatusBar("Enabling DTO");
    let result = await itemDTO.Enable()
    if(result.Status==StatusResult.Error)
    {
      this.HideStatusBar(); 
      return Promise.resolve(result);
    }
    result= await itemDTO.Device.DtoLinux.GetAll();
    if(result.Status==StatusResult.Ok)
    {
      this.Refresh();
      this.SaveDevices();
    }
    //
    this.HideStatusBar(); 
    return Promise.resolve(result); 
  }

  public async DisableDTO(itemDTO:IotDeviceDTO):  Promise<IotResult> {
    this.ShowStatusBar("Disabling DTO");
    let result = await itemDTO.Disable()
    if(result.Status==StatusResult.Error)
    {
      this.HideStatusBar(); 
      return Promise.resolve(result);
    }
    result= await itemDTO.Device.DtoLinux.GetAll();
    if(result.Status==StatusResult.Ok)
    {
      this.Refresh();
      this.SaveDevices();
    }
    //
    this.HideStatusBar(); 
    return Promise.resolve(result);
  }

}
