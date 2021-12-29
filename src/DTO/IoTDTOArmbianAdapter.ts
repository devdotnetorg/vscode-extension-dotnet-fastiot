import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {IotDevice} from '../IotDevice';
import {IDtoAdapter} from './IDtoAdapter';
import {IoTDTO} from './IoTDTO';
import { IotResult,StatusResult } from '../IotResult';
import { StringTrim } from '../IoTHelper';

export class IoTDTOArmbianAdapter implements IDtoAdapter {
  private _config = {
    overlay_prefix: "",
    overlaydir: ""
  };

  public readonly Device:IotDevice;

  constructor(device: IotDevice){    
    this.Device=device;
    this.ReadConfig(device.DtoLinux.Config);
  }

  public ReadConfig(jsonObj:any){
    if(jsonObj)
      {
        this._config.overlay_prefix=<string>jsonObj.overlay_prefix;
        this._config.overlaydir=<string>jsonObj.overlaydir;
    }    
  }
  public WriteConfig():any{    
    return this._config;
  };
  
  public async GetAll():Promise<IotResult> {
    //Overlaydir definition
    this._config.overlaydir= this.GetOverlayDir(this.Device.Information.LinuxFamily);
    //Read armbianEnv.txt and getting a list of DTO
    var sshconfig  = {
      host: this.Device.Account.Host,
      port: this.Device.Account.Port,
      username: this.Device.Account.UserName,
      identity: this.Device.Account.PathKey,      
    };    
    let result = await this.Device.Client.RunScript(sshconfig,undefined, this.Device.Config.PathFolderExtension,
        "dto/armbiangetalloverlays",undefined, false,false);
    if(result.Status==StatusResult.Error) return Promise.resolve(result);
    //Parse
    //Enabled DTO
    const enabledDTOs = this.ParseInfornation(<string>result.SystemMessage);
    //Get all DTOs
    result = await this.Device.Client.ReadDir(sshconfig,undefined,this._config.overlaydir,false);
    if(result.Status==StatusResult.Error) return Promise.resolve(result);
    //Merge
    const dtosArray=this.MergeDTOs(enabledDTOs,result.SystemMessage);
    //output
    result= new IotResult(StatusResult.Ok,undefined,undefined);
    result.returnObject=dtosArray;
    return Promise.resolve(result);
  }

  public async Put(fileName:string, fileData:string):Promise<IotResult>{
    //determining the file name given the prefix    
    if(fileName.substring(0,this._config.overlay_prefix.length)!=this._config.overlay_prefix)
      fileName = `${this._config.overlay_prefix}-${fileName}`;      
    //writing a file to the overlaydir folder
    var sshconfig  = {
      host: this.Device.Account.Host,
      port: this.Device.Account.Port,
      username: this.Device.Account.UserName,
      identity: this.Device.Account.PathKey,      
    };
    //put file    
    let result = await this.Device.Client.PutFile(sshconfig,undefined,fileName,fileData, false);
    if(result.Status==StatusResult.Error) return Promise.resolve(result);
    //copy to folder overlays
    const paramsScript=`${fileName} ${this._config.overlaydir}`;
    result = await this.Device.Client.RunScript(sshconfig,undefined, this.Device.Config.PathFolderExtension,
        "dto/armbianputoverlay",paramsScript, false,false);    
    //output
    //result= new IotResult(StatusResult.Ok,undefined,undefined);
    return Promise.resolve(result);    
  }

  public async Delete(FsPath:string):Promise<IotResult>{
    var sshconfig  = {
      host: this.Device.Account.Host,
      port: this.Device.Account.Port,
      username: this.Device.Account.UserName,
      identity: this.Device.Account.PathKey,      
    };    
    const paramsScript=FsPath;
    const result = await this.Device.Client.RunScript(sshconfig,undefined, this.Device.Config.PathFolderExtension,
        "dto/armbiandeleteoverlay",paramsScript, false,false);    
    //output    
    return Promise.resolve(result);
  }

  private async BaseActionOverlay(FsPath:string,namescript:string):Promise<IotResult>{
    var sshconfig  = {
      host: this.Device.Account.Host,
      port: this.Device.Account.Port,
      username: this.Device.Account.UserName,
      identity: this.Device.Account.PathKey,      
    };
    //Making changes to /boot/armbianEnv.txt
    FsPath=path.basename(FsPath);
    FsPath=FsPath.substring(this._config.overlay_prefix.length+1,FsPath.length-5);        
    const paramsScript=FsPath;
    const result = await this.Device.Client.RunScript(sshconfig,undefined, this.Device.Config.PathFolderExtension,
      namescript,paramsScript, false,false);
    //output    
    return Promise.resolve(result);
  } 

  public async Enable(FsPath:string):Promise<IotResult>{
    const result = await this.BaseActionOverlay(FsPath,"dto/armbianenableoverlay");
    //output
    return Promise.resolve(result);
  }

	public async Disable(FsPath:string):Promise<IotResult>{
    const result = await this.BaseActionOverlay(FsPath,"dto/armbiandisableoverlay");
    //output
    return Promise.resolve(result);
  };

  //---------
  private GetOverlayDir(msg:string|undefined): string{    
    const linuxFamily = msg;
    let overlayDir:string;
    switch(linuxFamily) { 
      case "sunxi64": {
        overlayDir="/boot/dtb/allwinner/overlay";
        break; 
      } 
      case "meson64": {
        overlayDir="/boot/dtb/amlogic/overlay";
        break; 
      }
      case "rockchip64": {
        overlayDir="/boot/dtb/rockchip/overlay";
        break; 
      } 
      case "rk3399": { 
        overlayDir="/boot/dtb/rockchip/overlay";
        break; 
      }         
      default: { 
        overlayDir="/boot/dtb/overlay";
        break;
      } 
    }
    //
    return overlayDir;    
  }

  private ParseInfornation(msg:string): Array<string>{
    let array1=msg.split(new RegExp("\n"));
    let overlays:string="";
    let overlaysArray:Array<string>=[];
    array1.forEach(element =>
			{				
				const array2=element.split(':');		
            //
            switch(array2[0]) { 
               case "overlay_prefix": {
                 this._config.overlay_prefix=StringTrim(array2[1]);
                 break; 
               } 
               case "overlays": {
                 overlays=StringTrim(array2[1]);
                 break; 
               }               
               default: { 
                  //statements; 
                  break; 
               } 
            }            
		});
    //Parse overlays
    array1=overlays.split(new RegExp(" "));
    array1.forEach(element =>
			{
        overlaysArray.push(element);        
		  });
    //
    return overlaysArray;
  }

  private MergeDTOs(enabledDTOs: Array<string>, DTOFiles:any):Array<IoTDTO>{
    const files = <Array<any>>DTOFiles;
    let resultDtos: Array<IoTDTO>=[];
    //
    files.forEach(element =>
			{				
				const filename=<string>element.filename;
        if(filename.length>this._config.overlay_prefix.length)
        {
          const prefixFilename=filename.substring(0,this._config.overlay_prefix.length);
          const extensionFilename=path.extname(filename);
          //
          if(prefixFilename==this._config.overlay_prefix && extensionFilename == ".dtbo"){
            //check Enabled
            const filenameForMerge=filename.substring(
              this._config.overlay_prefix.length+1,filename.length - extensionFilename.length);
            //
            let isEnabledDTO:boolean= false;
            const foundItem=enabledDTOs.find(x=>x==filenameForMerge);
            if(foundItem) isEnabledDTO=true;            
            //create DTO
            let item = new IoTDTO(this.Device);
            item.Init(isEnabledDTO,filenameForMerge,`${this._config.overlaydir}/${filename}`);
            resultDtos.push(item);
          }          
        }
        //
		  });
    //
    return resultDtos;        
    //return resultDtos.sort(compare);
  }

}

/*
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
*/
  