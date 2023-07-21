import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {BaseTreeItem} from './shared/BaseTreeItem';
import {IotDevice} from './IotDevice';
import { IotResult,StatusResult } from './Shared/IotResult';
import { DTO } from './Dto/DTO';

export class IotDeviceDTO extends BaseTreeItem {
  public Parent: IotDevice| IotDeviceDTO;
  public Childs: Array<IotDeviceDTO>=[];
  public Device: IotDevice;

  public Config:any;

  public Items: Array<DTO>=[];

  private _dto: DTO| undefined;
  private get Dto(): DTO| undefined {
    return this._dto;};
  private set Dto(dto: DTO| undefined) {
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
    tooltip: string | vscode.MarkdownString | undefined,
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
    /*
    this.iconPath = {
      light: path.join(__filename, '..', '..', 'resources', 'light', 'dto.svg'),
      dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dto.svg')
    };
    */
    this.iconPath = new vscode.ThemeIcon("layers");
  }

  public InitDTO( dto: DTO)
  {    
    //Dto
    this.Dto=dto;
  }  

  public async GetAll(): Promise<IotResult> {
    if(!this._dto) this._dto= new DTO(this.Device);
    if(!this._dto.Compatible)
      return Promise.resolve(new IotResult(StatusResult.Error,"There is no supported DTO adapter for this device",undefined));
    //Ping
    if(this.Device.Account.Host)
    {
      const result=await this.Device.ConnectionTest();
      if(result.Status==StatusResult.Error) return Promise.resolve(result);  
    }    
    //
    let result = await this._dto.GetAll();
    if(result.Status==StatusResult.Ok)
      {
        this.Items=<Array<DTO>>result.returnObject;
        //create child elements
        this.Build();
      }
    //
    return Promise.resolve(result);    
  }

  public async Put(fileName:string, fileData:string,fileType:string):Promise<IotResult>{
    if(!this._dto) this._dto= new DTO(this.Device);
    if(!this._dto.Compatible)
      return Promise.resolve(new IotResult(StatusResult.Error,"There is no supported DTO adapter for this device",undefined));    
    //Ping
    if(this.Device.Account.Host)
    {
      let result=await this.Device.ConnectionTest();
      if(result.Status==StatusResult.Error) return Promise.resolve(result);  
    }
    //
    const result= await this._dto.Put(fileName,fileData,fileType);
    if(result.Status==StatusResult.Ok)
    {
      await this.GetAll();
    }    
    return Promise.resolve(result);
  }

  public async Delete():Promise<IotResult>{
    if(!this._dto) this._dto= new DTO(this.Device);
    if(!this._dto.Compatible)
      return Promise.resolve(new IotResult(StatusResult.Error,"There is no supported DTO adapter for this device",undefined));    
    //Ping
    if(this.Device.Account.Host)
    {
      const result=await this.Device.ConnectionTest();
      if(result.Status==StatusResult.Error) return Promise.resolve(result);  
    }    
    //
    const result= await this._dto.Delete();
    if(result.Status==StatusResult.Ok)
    {
      await this.GetAll();
    }    
    return Promise.resolve(result);
  }

  public async Enable():Promise<IotResult>{
    if(!this._dto) this._dto= new DTO(this.Device);
    if(!this._dto.Compatible)
      return Promise.resolve(new IotResult(StatusResult.Error,"There is no supported DTO adapter for this device",undefined));    
    //Ping
    if(this.Device.Account.Host)
    {
      const result=await this.Device.ConnectionTest();
      if(result.Status==StatusResult.Error) return Promise.resolve(result);  
    }    
    //
    const result= await this._dto.Enable();
    if(result.Status==StatusResult.Ok)
    {
      await this.GetAll();
    }    
    return Promise.resolve(result);
  }

  public async Disable():Promise<IotResult>{
    if(!this._dto) this._dto= new DTO(this.Device);
    if(!this._dto.Compatible)
      return Promise.resolve(new IotResult(StatusResult.Error,"There is no supported DTO adapter for this device",undefined));    
    //Ping
    if(this.Device.Account.Host)
    {
      const result=await this.Device.ConnectionTest();
      if(result.Status==StatusResult.Error) return Promise.resolve(result);  
    }    
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
    //==========================
    let jsonObj = {
      config: {},
      items:[]            
    };
    //==========================
    //Fill
    //config
    jsonObj.config=this.Config;
    //Items
    this.Items.forEach(item =>
      {       
        jsonObj.items.push(<never>item.ToJSON());
      });
    //
    return jsonObj;    
  }

  public FromJSON(obj:any){
    //Fill
    //config
    this.Config=obj.config;
    //items
    if(!obj.items) return;
    let index=0;    
    do {
      let item=obj.items[index];
      if(item)
        {
          //create DTO          
          let dtoName = <string> item.name;
          let dtoEnabled = <boolean> item.enabled;
          let dtofsPath = <string> item.fspath;
          let dto = new DTO(this.Device);
          dto.Init(dtoEnabled,dtoName,dtofsPath);
          //push
          this.Items.push(dto);
          //next position
          index=index+1;
        }else break;      
      } 
    while(true)        
    //create child elements
    if( this.Items.length>0 ) this.Build();
  }
    
}
