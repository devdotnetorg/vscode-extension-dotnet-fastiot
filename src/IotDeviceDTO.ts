import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {BaseTreeItem} from './BaseTreeItem';
import {IotDevice} from './IotDevice';
import {IoTGpiochip} from './GPIO/IoTGpiochip';
import { IotResult,StatusResult } from './IotResult';
import { TypePackage } from './IotDevicePackage';

import { IoTDTO } from './Dto/IoTDTO';

export class IotDeviceDTO extends BaseTreeItem {
  public Parent: IotDevice| IotDeviceDTO;
  public Childs: Array<IotDeviceDTO>=[];
  public Device: IotDevice;

  public Config:any;

  public Items: Array<IoTDTO>=[];

  private _dto: IoTDTO| undefined;
  private get Dto(): IoTDTO| undefined {
    return this._dto;};
  private set Dto(dto: IoTDTO| undefined) {
      this._dto=dto;
      //      
      this.label= this._dto?.Name;      
      this.tooltip = this._dto?.FsPath;      
      //
      if(this._dto?.IsEnabled)
      {
        this.iconPath = {
          light: path.join(__filename, '..', '..', 'resources', 'light', 'yes.svg'),
          dark: path.join(__filename, '..', '..', 'resources', 'dark', 'yes.svg')
        };
        //view
        this.contextValue="iotdto_on";
      }else
      {
        this.iconPath = {
          light: path.join(__filename, '..', '..', 'resources', 'light', 'no.svg'),
          dark: path.join(__filename, '..', '..', 'resources', 'dark', 'no.svg')
        };
        //view
        this.contextValue="iotdto_off";
      }
  };
    
  constructor(            
    collapsibleState: vscode.TreeItemCollapsibleState,
    parent: IotDevice| IotDeviceDTO,
    device: IotDevice
  ){
    super("label",undefined,undefined,collapsibleState);
    this.Parent=parent;
    this.Device=device;
  };

  public InitRoot(
    label: string,
    description: string|  undefined,
    tooltip: string|  undefined,  
    collapsibleState: vscode.TreeItemCollapsibleState,
    )
  {
    this.label=label;
    this.description=description;
    this.tooltip=tooltip;
    this.collapsibleState=collapsibleState;
    //view
    this.contextValue="iotdtos";
    //
    this.iconPath = {
      light: path.join(__filename, '..', '..', 'resources', 'light', 'dto.svg'),
      dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dto.svg')
    };
  }

  public InitDTO( dto: IoTDTO)
  {    
    //Dto
    this.Dto=dto;
  }  

  public async GetAll(): Promise<IotResult> {
    if(!this._dto) this._dto= new IoTDTO(this.Device);
    if(!this._dto.Compatible)
      return Promise.resolve(new IotResult(StatusResult.Error,"There is no supported DTO adapter for this device",undefined));
    //
    let result = await this._dto.GetAll();
    if(result.Status==StatusResult.Ok)
      {
        this.Items=<Array<IoTDTO>>result.returnObject;
        //create child elements
        this.Build();
      }
    //
    return Promise.resolve(result);    
  }

  public async Put(fileName:string, fileData:string):Promise<IotResult>{
    if(!this._dto) this._dto= new IoTDTO(this.Device);
    if(!this._dto.Compatible)
      return Promise.resolve(new IotResult(StatusResult.Error,"There is no supported DTO adapter for this device",undefined));
    //   
    const result= await this._dto.Put(fileName,fileData);
    if(result.Status==StatusResult.Ok)
    {
      await this.GetAll();
    }    
    return Promise.resolve(result);
  }

  public async Delete():Promise<IotResult>{
    if(!this._dto) this._dto= new IoTDTO(this.Device);
    if(!this._dto.Compatible)
      return Promise.resolve(new IotResult(StatusResult.Error,"There is no supported DTO adapter for this device",undefined));
    //   
    const result= await this._dto.Delete();
    if(result.Status==StatusResult.Ok)
    {
      await this.GetAll();
    }    
    return Promise.resolve(result);
  }

  public async Enable():Promise<IotResult>{
    if(!this._dto) this._dto= new IoTDTO(this.Device);
    if(!this._dto.Compatible)
      return Promise.resolve(new IotResult(StatusResult.Error,"There is no supported DTO adapter for this device",undefined));
    //   
    const result= await this._dto.Enable();
    if(result.Status==StatusResult.Ok)
    {
      await this.GetAll();
    }    
    return Promise.resolve(result);
  }

  public async Disable():Promise<IotResult>{
    if(!this._dto) this._dto= new IoTDTO(this.Device);
    if(!this._dto.Compatible)
      return Promise.resolve(new IotResult(StatusResult.Error,"There is no supported DTO adapter for this device",undefined));
    //   
    const result= await this._dto.Disable();
    if(result.Status==StatusResult.Ok)
    {
      await this.GetAll();
    }    
    return Promise.resolve(result);
  }

  //---------

  private CreateChildElements(){
    //create child elements
    this.Childs=[];    
    let dtoNode:IotDeviceDTO;
    //
    this.Items.forEach((element) => {
      dtoNode = new IotDeviceDTO(vscode.TreeItemCollapsibleState.None,this,this.Device);
      dtoNode.InitDTO(element);      
      this.Childs.push(dtoNode);
    });    
  }

  public Build(){   
    this.CreateChildElements();
  }

  public ToJSON():any{
    console.log("Not Implemented")
  }

  public FromJSON(obj:any):any{
    console.log("Not Implemented")
  }
    
}