import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {BaseTreeItem} from './BaseTreeItem';
import {IotDevice} from './IotDevice';
import {IoTGpiochip} from './GPIO/IoTGpiochip';
import { IotResult,StatusResult } from './IotResult';
import { TypePackage } from './IotDevicePackage';

export class IotDeviceGpiochip extends BaseTreeItem {
  public Items: Array<IoTGpiochip>=[];

  public Parent: IotDevice| IotDeviceGpiochip;
  public Childs: Array<IotDeviceGpiochip>=[]; 
  public Device: IotDevice;
    
  private _gpiochip: IoTGpiochip| undefined; 
  public get Gpiochip(): IoTGpiochip| undefined {
    return this._gpiochip;};
  public set Gpiochip(gpiochip: IoTGpiochip| undefined) {
      this._gpiochip=gpiochip;
      //
      this.label=`${this._gpiochip?.Name} [${this._gpiochip?.Description}]`;
      this.description=`${this._gpiochip?.NumberLines} lines`;      
      this.tooltip =`${this.label} (${this.description})`;
  };
  
  constructor(            
    collapsibleState: vscode.TreeItemCollapsibleState,
    parent: IotDevice| IotDeviceGpiochip,
    device: IotDevice
  ){
    super("label",undefined,undefined,collapsibleState);
    this.Parent=parent;
    this.Device=device;
  };

  public InitRoot(
    label: string,
    description: string|  undefined,
    tooltip: string | vscode.MarkdownString | undefined,
    collapsibleState: vscode.TreeItemCollapsibleState,
    )
  {
    this.label=label;
    this.description=description;
    this.tooltip=tooltip;
    this.collapsibleState=collapsibleState;
    //view
    this.contextValue="iotgpios";
    //
    this.iconPath = {
      light: path.join(__filename, '..', '..', 'resources', 'light', 'gpio.svg'),
      dark: path.join(__filename, '..', '..', 'resources', 'dark', 'gpio.svg')
    };
  }

  public InitGpiochip(gpiochip:IoTGpiochip)
  {
    this.Gpiochip=gpiochip;    
    //view
    this.contextValue="iotgpiochip";
  }  

  public async Detect():  Promise<IotResult> {
    //Checking for the presence of the Libgpiod library
    const packageLibgpiod = this.Device.PackagesLinux.Childs.find(x=>x.NamePackage==TypePackage.libgpiod);
    if(!packageLibgpiod?.isInstalled)      
      return Promise.resolve(new IotResult(StatusResult.Error,"Libgpiod library not installed.",undefined));   
    //
    let result = await this.Client.RunScript(this.Device.Account.SshConfig,undefined,this.Device.Config.ExtensionPath,
        "gpiodetecttojson",undefined, false,false);
    if(result.Status==StatusResult.Error) return Promise.resolve(result);
    //parse result
    this.ParseInfornation(result.SystemMessage);
    //create child elements
    this.Build();
    //
    return Promise.resolve(result);        
  }

  /*
  private ParseInfornation(msg:string|undefined):void{
    if (!msg) return;
    console.log(`parseInfornation = ${msg}`);        
    const array1=msg.split(new RegExp("\n"));
    //
    this.Items=[];
    array1.forEach(element =>
			{
        if(element!=""){
          let gpiochip = new IoTGpiochip(0,"","",0);
          gpiochip.Parse(element);
          this.Items.push(gpiochip);
        }        
      });
  }
  */

  private ParseInfornation(msg:string|undefined):void{
    if (!msg) return;
    console.log(`parseInfornation = ${msg}`);
    //Fill    
    let jsonObj = JSON.parse(msg);    
    //items
    this.Items=[];
    let index=0;    
    do {
      let item=jsonObj[index];
      if(item)
        {
          //create DTO          
          let chipId = parseInt(item.id);
          let chipDescription = <string> item.description;
          let chipNumberlines = parseInt(item.numberlines);
          //
          let gpiochip = new IoTGpiochip(chipId,"gpiochip"+chipId,chipDescription,chipNumberlines);
          this.Items.push(gpiochip);
          //next position
          index=index+1;
        }else break;      
      } 
    while(true)
  }

  private CreateChildElements(){
    //create child elements
    this.Childs=[];    
    let gpiochipNode:IotDeviceGpiochip;
    //
    this.Items.forEach((element) => {
      gpiochipNode = new IotDeviceGpiochip(vscode.TreeItemCollapsibleState.None,this,this.Device);
      gpiochipNode.InitGpiochip(element);      
      this.Childs.push(gpiochipNode);
    });
  }

  public Build(){   
    this.CreateChildElements();
  }

  public ToJSON():any{
    //Fill
    const json="[]";
    let jsonObj = JSON.parse(json);
    //Items
    this.Items.forEach(item =>
      {
        jsonObj.push(<never>item.ToJSON());
      });
    //
    return jsonObj;    
  }

  public FromJSON(obj:any){
    //Fill        
    //items
    if(!obj) return;
    let index=0;    
    do {
      let item=obj[index];
      if(item)
        {
          //create Gpiochip
          let idGpiochip = <number> item.id;
          let nameGpiochip = <string> item.name;
          let descriptionGpiochip = <string> item.description;
          let numberlinesGpiochip = <number> item.numberlines;
          //
          let gpiochip = new IoTGpiochip(idGpiochip,nameGpiochip,
            descriptionGpiochip,numberlinesGpiochip);          
          //push
          this.Items.push(gpiochip);
          //next position
          index=index+1;
        }else break;      
      } 
    while(true)        
    //create child elements
    if( this.Items.length>0 ) this.Build();
  }   
}
