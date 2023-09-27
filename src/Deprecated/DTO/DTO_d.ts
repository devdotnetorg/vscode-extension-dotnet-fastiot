import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IotDevice_d } from '../IotDevice_d';
import { IDtoAdapter_d } from './IDtoAdapter_d';
import { DTOArmbianAdapter_d } from './DTOArmbianAdapter_d';
import { IotResult,StatusResult } from '../../Shared/IotResult';

export class DTO_d {  
  private _device: IotDevice_d;
  private _adapterDTO?:IDtoAdapter_d;

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
  
  constructor(device: IotDevice_d){    
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

  public GetAdapter():IDtoAdapter_d| undefined
  {
    const device = this._device;    
    let adapter:IDtoAdapter_d| undefined;
    //Select adapter - Armbian
    if(device.Information.ArmbianVersion)
      adapter=new DTOArmbianAdapter_d(device);
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
        result.returnObject=(<Array<DTO_d>>result.returnObject).sort(compare);
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

export function compare( a:DTO_d, b:DTO_d ) {
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