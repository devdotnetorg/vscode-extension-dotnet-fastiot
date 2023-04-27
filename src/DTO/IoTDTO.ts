import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {IotDevice} from '../IotDevice';
import {IDtoAdapter} from './IDtoAdapter';
import {IoTDTOArmbianAdapter} from './IoTDTOArmbianAdapter';
import { IotResult,StatusResult } from '../IotResult';

export class IoTDTO {  
  private _device: IotDevice;
  private _adapterDTO?:IDtoAdapter;

  private _compatible:boolean=false;
  public get Compatible(): boolean { 
    return this._compatible;};

  private _isEnabled:boolean=false;
  public get IsEnabled(): boolean { 
    return this._isEnabled;};      
  private _name?: string; 
  public get Name(): string| undefined {
    return this._name;};
  private _fsPath?: string;
  public get FsPath(): string| undefined {
    return this._fsPath;};  
  
  constructor(device: IotDevice){    
    this._device=device;
    //select adapter
    this._adapterDTO=this.GetAdapter()
    if(this._adapterDTO) this._compatible=true;
  };
  
  public Init(isEnabled:boolean, name: string, fsPath: string)
  {    
    this._isEnabled=isEnabled;
    this._name=name;
    this._fsPath=fsPath;  
  }

  public GetAdapter():IDtoAdapter| undefined
  {
    const device = this._device;    
    let adapter:IDtoAdapter| undefined;
    //Select adapter - Armbian
    if(device.Information.ArmbianVersion)
      adapter=new IoTDTOArmbianAdapter(device);
    //Select adapter - other OS
    //using only - device

    //
    return adapter;
  }  

  public async  GetAll():  Promise<IotResult> {
    if(this._adapterDTO)
    {
      let result = await this._adapterDTO.GetAll();
      if(result.Status==StatusResult.Ok)
      {
        //sort
        result.returnObject=(<Array<IoTDTO>>result.returnObject).sort(compare);
        //
        const jsonObj=this._adapterDTO.WriteConfig();
        this._device.DtoLinux.Config=jsonObj;
      }      
      return Promise.resolve(result);
    }
    //
    return Promise.resolve(new IotResult(StatusResult.Error,"DTO adapter not initialized"));
  }

  public async Put(fileName:string, fileData:string,fileType:string):Promise<IotResult>{
    //low case
    fileName=fileName.toLowerCase();
    //
    if(this._adapterDTO)
    {
      const result = await this._adapterDTO.Put(fileName,fileData,fileType);      
      return Promise.resolve(result);
    }
    return Promise.resolve(new IotResult(StatusResult.Error,"DTO object not initialized"));
  }

  public async Delete():Promise<IotResult>{
    //this._fsPath
    if(this._adapterDTO && this._fsPath)
    {
      const result = await this._adapterDTO.Delete(this._fsPath);      
      return Promise.resolve(result);
    }
    return Promise.resolve(new IotResult(StatusResult.Error,"DTO object not initialized"));
  }

  public async Enable():Promise<IotResult>{
    if(this._adapterDTO && this._fsPath)
    {
      const result = await this._adapterDTO.Enable(this._fsPath);      
      return Promise.resolve(result);
    }
    return Promise.resolve(new IotResult(StatusResult.Error,"DTO object not initialized or no fsPath"));
  }

	public async Disable():Promise<IotResult>{
    if(this._adapterDTO && this._fsPath)
    {
      const result = await this._adapterDTO.Disable(this._fsPath);      
      return Promise.resolve(result);
    }
    return Promise.resolve(new IotResult(StatusResult.Error,"DTO object not initialized or no fsPath"));
  };

  public ToJSON():any{    
    //Fill
    const json="{}";
    let jsonObj = JSON.parse(json); 
    //name    
    let keyItem="name";
    let valueItem=this.Name;
    jsonObj[keyItem]=valueItem;
    //IsEnabled
    keyItem="enabled";
    let valueItemBool=this.IsEnabled;
    jsonObj[keyItem]=valueItemBool;
    //FsPath
    keyItem="fspath";
    valueItem=this.FsPath;
    jsonObj[keyItem]=valueItem;
    //          
    return jsonObj;
  }
}

export function compare( a:IoTDTO, b:IoTDTO ) {
  if(a.Name && b.Name){
    if ( a.Name < b.Name ){
      return -1;
    }
  }
  if(a.Name && b.Name){
    if ( a.Name > b.Name ){
      return 1;
    }
  }  
  return 0;
}
