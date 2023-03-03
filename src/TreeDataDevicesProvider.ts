import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {BaseTreeItem} from './BaseTreeItem';
import {IotDevice} from './IotDevice';
import {IotDevicePackage,TypePackage} from './IotDevicePackage';
import {IotDeviceDTO} from './IotDeviceDTO';
import {IoTHelper} from './Helper/IoTHelper';
import {IotResult,StatusResult} from './IotResult';
import {IotConfiguration} from './Configuration/IotConfiguration';
import {IContexUI} from './ui/IContexUI';

export class TreeDataDevicesProvider implements vscode.TreeDataProvider<BaseTreeItem> {    
  public RootItems:Array<IotDevice>=[];

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
  
  private _contextUI:IContexUI;
  public SaveDevicesCallback:(data:any) =>void;
    
  constructor(
    saveDevicesCallback:(data:any) =>void,
    config:IotConfiguration,    
    jsonDevices:any,
    contextUI:IContexUI
  ) {
      this._contextUI=contextUI;
      //
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
  public async AddDevice(hostName: string,port: number,userName: string,password: string,accountNameDebug:string): Promise<IotResult> {         
      let device = new IotDevice(this.Config);
      //Connection test device
      this._contextUI.ShowBackgroundNotification("Checking the network connection");
      let result=await device.ConnectionTest(hostName,port,userName,password);
      if(result.Status==StatusResult.Ok)
          this._contextUI.Output(result);
        else return Promise.resolve(result);
      this._contextUI.ShowBackgroundNotification("Create a device");
      this._contextUI.Output("Create a device");
      //event subscription
      let handler=device.Client.OnChangedStateSubscribe(event => {        
        if(event.status) this._contextUI.ShowBackgroundNotification(event.status);
        if(event.status) this._contextUI.Output(event.status);
        if(event.console) this._contextUI.Output(event.console); 
      });
      result = await device.Create(hostName,port,userName, password,accountNameDebug);
      if(result.Status==StatusResult.Error) return Promise.resolve(result);
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
      //
      return Promise.resolve(result);   
  }

  public async SaveDevices(): Promise<void> {
    const jsonObj = this.ToJSON();
    this.SaveDevicesCallback(jsonObj);     
  }      
  
  private async RecoveryDevices(jsonObj:any): Promise<void>{    
    //Recovery devices from config in JSON format
    this.RootItems=[];
    await this.FromJSON(jsonObj);
    //Refresh treeView
    this.Refresh();
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

  public async DeleteDevice(idDevice:string): Promise<IotResult> {
    let result :IotResult;
    let device = this.FindbyIdDevice(idDevice);    
    if(device){
      const index=this.RootItems.indexOf(device);
      this.RootItems.splice(index,1);
      result = new IotResult(StatusResult.Ok,"Device removed");
      return Promise.resolve(result);   
    }
    result = new IotResult(StatusResult.Error,"Device not found");
    return Promise.resolve(result);   
  } 

  //------------ Packages ------------
  public async CheckAllPackages(idDevice:string):  Promise<IotResult> {
    let device = this.FindbyIdDevice(idDevice);
    let result = new IotResult(StatusResult.None,undefined,undefined); 
    if(device){
      //Ping
      if(device.Account.Host) {
        const result=await device.ConnectionTest();
        if(result.Status==StatusResult.Error) return Promise.resolve(result);
      }
    //event subscription
    let handler=device.PackagesLinux.Client.OnChangedStateSubscribe(event => {
      //output
      if(event.status) this._contextUI.Output(event.status);
      if(event.console) this._contextUI.Output(event.console);
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
    this.SaveDevices();
    }    
    //    
    return Promise.resolve(result); 
  }

  public async InstallPackage(idDevice:string,itemPackage:TypePackage,objJSON:any): Promise<IotResult> {
    let device= this.FindbyIdDevice(idDevice);
    let result=new IotResult(StatusResult.None,"message");
    if(!device){
      result=new IotResult(StatusResult.Error,"Device not found");
      return Promise.resolve(result);
    }     
    let devicePackage=device.PackagesLinux.Childs.find(x=>x.NamePackage==itemPackage);
    if(!devicePackage)
    {
      result=new IotResult(StatusResult.Error,"Package not found");
      return Promise.resolve(result);
    }
    //event subscription    
    let handler=devicePackage.Client.OnChangedStateSubscribe(event => {
      if(event.console) this._contextUI.Output(event.console);
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
    //
    return Promise.resolve(result);
  }

  public async UpgradePackage(itemPackage:TypePackage,idDevice:string,objJSON:any): Promise<IotResult> {
    return await this.InstallPackage(idDevice,itemPackage,objJSON);      
  }

  public async UnInstallPackage(idDevice:string,itemPackage:TypePackage,objJSON:any): Promise<IotResult> {
    let device= this.FindbyIdDevice(idDevice);
    let result=new IotResult(StatusResult.None,"message");
    if(!device){
      result=new IotResult(StatusResult.Error,"Device not found");
      return Promise.resolve(result);
    }     
    let devicePackage=device.PackagesLinux.Childs.find(x=>x.NamePackage==itemPackage);
    if(!devicePackage)
    {
      result=new IotResult(StatusResult.Error,"Package not found");
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
    //
    return Promise.resolve(result);
  }

  public async TestPackage(idDevice:string,itemPackage:TypePackage): Promise<IotResult> {    
    let device= this.FindbyIdDevice(idDevice);
    let result=new IotResult(StatusResult.None,"message");
    if(!device){
      result=new IotResult(StatusResult.Error,"Device not found");
      return Promise.resolve(result);
    }     
    let devicePackage=device.PackagesLinux.Childs.find(x=>x.NamePackage==itemPackage);
    if(!devicePackage)
    {
      result=new IotResult(StatusResult.Error,"Package not found");
      return Promise.resolve(result);
    }    
    //Test
    result = await devicePackage.Test();
    //
    return Promise.resolve(result);
  }

  //------------ Gpiochips ------------
  public async DetectGpiochips(idDevice:string):  Promise<IotResult> {
    let device = this.FindbyIdDevice(idDevice);
    let result = new IotResult(StatusResult.None,undefined,undefined);
    if(device)
    {
      //Ping
      if(device.Account.Host)
      {
        const result=await device.ConnectionTest();
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
      result=new IotResult(StatusResult.Error,"Device not found.")
    }
    //
    return Promise.resolve(result); 
  }

  //------------ DTOs ------------
  public async GetAllDTO(idDevice:string): Promise<IotResult> {
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
      result=new IotResult(StatusResult.Error,"Device not found.")
    }
    //
    return Promise.resolve(result); 
  }

  public async AddDTO(idDevice:string, fileName:string, fileData:string,fileType:string):  Promise<IotResult> {
    let device = this.FindbyIdDevice(idDevice);
    let result = new IotResult(StatusResult.None);
    if(device)
    {
      result= await device.DtoLinux.Put(fileName,fileData,fileType);
      if(result.Status==StatusResult.Error) return Promise.resolve(result);
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
    return Promise.resolve(result); 
  }

  public async DeleteDTO(itemDTO:IotDeviceDTO):  Promise<IotResult> {
    let result = await itemDTO.Delete()
    if(result.Status==StatusResult.Error)
    {
      return Promise.resolve(result);
    }
    result= await itemDTO.Device.DtoLinux.GetAll();
    if(result.Status==StatusResult.Ok)
    {
      this.Refresh();
      this.SaveDevices();
    }
    //
    return Promise.resolve(result); 
  }

  public async EnableDTO(itemDTO:IotDeviceDTO):  Promise<IotResult> {
    let result = await itemDTO.Enable()
    if(result.Status==StatusResult.Error)
    {
      return Promise.resolve(result);
    }
    result= await itemDTO.Device.DtoLinux.GetAll();
    if(result.Status==StatusResult.Ok)
    {
      this.Refresh();
      this.SaveDevices();
    }
    //
    return Promise.resolve(result); 
  }

  public async DisableDTO(itemDTO:IotDeviceDTO):  Promise<IotResult> {
    let result = await itemDTO.Disable()
    if(result.Status==StatusResult.Error)
    {
      return Promise.resolve(result);
    }
    result= await itemDTO.Device.DtoLinux.GetAll();
    if(result.Status==StatusResult.Ok)
    {
      this.Refresh();
      this.SaveDevices();
    }
    //
    return Promise.resolve(result);
  }

}
