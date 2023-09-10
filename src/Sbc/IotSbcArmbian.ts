import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { EntityBase } from '../Entity/EntityBase';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IoTHelper } from '../Helper/IoTHelper';
import { launchHelper } from '../Helper/launchHelper';
import { dotnetHelper } from '../Helper/dotnetHelper';
import { IConfiguration } from '../Configuration/IConfiguration';
import { FilesValidator } from '../Validator/FilesValidator';

import { SbcArmbianType } from '../Types/SbcArmbianType';

export class IotSbcArmbian  {
  private _boardFamily?:string; //BOARDFAMILY=sun50iw1 from cat /etc/armbian-release
  public get BoardFamily(): string| undefined {
    return this._boardFamily;}
  private _version?:string; //VERSION=21.05.1 from cat /etc/armbian-release
  public get Version(): string| undefined {
    return this._version;}
  private _linuxFamily?:string; //LINUXFAMILY=sunxi64 from cat /etc/armbian-release
  public get LinuxFamily(): string| undefined {
    return this._linuxFamily;}

  constructor() {}

  public Parse(obj:any): IotResult {
    let result:IotResult;
    try {
      if (obj.version) {
        this._version=obj.version;
        this._boardFamily=obj.boardfamily;
        this._linuxFamily=obj.linuxfamily;
      }
      result = new IotResult(StatusResult.Ok);
    } catch (err: any){
      result= new IotResult(StatusResult.Error,`JSON parse error.`,err);
    }
    return result;
  }
  
  public ToJSON():SbcArmbianType {
    //blank
    let obj:SbcArmbianType = {
      boardfamily: undefined,
      version: undefined,
      linuxfamily: undefined
    };
    try {
      //Fill
      if (this._version) {
        obj = {
          boardfamily: this.BoardFamily,
          version: this.Version,
          linuxfamily: this.LinuxFamily
        }
      };
    } catch (err: any){}
    //result
    return obj;
  }

  public FromJSON(obj:SbcArmbianType) {
    try {
      if (obj.version) {
        this._boardFamily=obj.boardfamily;
        this._version=obj.version;
        this._linuxFamily=obj.linuxfamily;
      }
    } catch (err: any){}
  }

}
