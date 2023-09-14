import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {BaseTreeItem_d} from './shared/BaseTreeItem_d';
import {IotDevice_d} from './IotDevice_d';
import {IotItemTree_d} from './shared/IotItemTree_d';
import { IotResult,StatusResult } from '.././Shared/IotResult';

export class IotDeviceInformation extends BaseTreeItem_d{  
   
  public Parent: IotDevice_d;
  public Childs: Array<IotItemTree_d>=[];
  public Device: IotDevice_d;

  //apt-get install lsb-release
  public Hostname: string| undefined; //$uname -n = bananapim64  
  public Architecture: string| undefined; //$uname -m = aarch64
  public OsKernel: string| undefined; //$uname -r = 5.10.34-sunxi64
  public OsName:string| undefined; //$lsb_release -i = Distributor ID: Ubuntu
  public OsDescription: string| undefined; //$lsb_release -d = Description: Ubuntu 18.04.5 LTS
  public OsRelease: string| undefined; //$lsb_release -r = Release: 18.04
  public OsCodename: string| undefined; //$lsb_release c = Codename: bionic  
  
  public BoardName: string| undefined; //BOARD_NAME="Banana Pi M64" from cat /etc/armbian-release
  public BoardFamily: string| undefined; //BOARDFAMILY=sun50iw1 from cat /etc/armbian-release
  public ArmbianVersion: string| undefined; //VERSION=21.05.1 from cat /etc/armbian-release
  public LinuxFamily: string| undefined; //LINUXFAMILY=sunxi64 from cat /etc/armbian-release
  //cat /etc/armbian-release | grep 'BOARD_NAME\|BOARDFAMILY\|VERSION\|LINUXFAMILY'

  //Categories of existence
  public Existence: Existences = Existences.none;
  
  constructor(
    label: string,
    description: string|  undefined,
    tooltip: string | vscode.MarkdownString | undefined,
    collapsibleState: vscode.TreeItemCollapsibleState,
    parent: IotDevice_d,
    device: IotDevice_d    
  ){
    super(label,description,tooltip,collapsibleState);
    this.Parent=parent;
    this.Device=device;
  }

  public async Get(sshconfig:any): Promise<IotResult>{      
      this.Client.FireChangedState({
         status:undefined,
         console:"Run: pregetinformation.sh",
         obj:undefined
       });       
      //# apt-get update иногда останавливает выполнение из-за WARNING
      // которые не являются критическими, поэтому выполнение только
      // как Stream
      let result = await this.Client.RunScript(sshconfig,undefined, this.Device.Config.Folder.Extension.fsPath,
         "pregetinformation",undefined, true,false);
      //Result
      if(result.Status==StatusResult.Error) return Promise.resolve(result);
      //get information
      this.Client.FireChangedState({
         status:undefined,
         console:"Run: getinformation.sh",
         obj:undefined
       });
      result = await this.Client.RunScript(sshconfig,undefined, this.Device.Config.Folder.Extension.fsPath,
          "getinformation",undefined, false,false);
      if(result.SystemMessage){
            this.Client.FireChangedState({
               status:undefined,
               console:result.SystemMessage,
               obj:undefined
             });
         }     
      if(result.Status==StatusResult.Error) return Promise.resolve(result);
      //parse result      
      await this.ParseInfornation(result.SystemMessage);
      //create child elements
      await this.CreateChildElements();
      //
      return Promise.resolve(result);    
  }

  private async ParseInfornation(msg:string|undefined): Promise<void>{
    if (!msg) return;
    console.log(`parseInfornation = ${msg}`);    
    //        
	 const array1=msg.split(new RegExp("\n"));
    array1.forEach(element =>
			{				
				const array2=element.split(':');		
            //
            switch(array2[0]) { 
               case "hostname": { 
                  this.Hostname=array2[1]; 
                  break; 
               } 
               case "architecture": { 
                  this.Architecture=array2[1]; 
                  break; 
               }
               case "osKernel": { 
                  this.OsKernel=array2[1]; 
                  break; 
               } 
               case "osName": { 
                  this.OsName=array2[1]; 
                  break; 
               }  
               case "osDescription": { 
                  this.OsDescription=array2[1]; 
                  break; 
               } 
               case "osRelease": { 
                  this.OsRelease=array2[1]; 
                  break; 
               }
               case "osCodename": { 
                  this.OsCodename=array2[1]; 
                  break; 
               } 
               case "boardName": {                         
                  this.BoardName=array2[1].replace('"','').replace('"','');
                  break; 
               }
               case "boardFamily": { 
                  this.BoardFamily=array2[1]; 
                  break; 
               } 
               case "armbianVersion": { 
                  this.ArmbianVersion=array2[1]; 
                  break; 
               } 
               case "linuxFamily": { 
                  this.LinuxFamily=array2[1]; 
                  break; 
               } 
               case "existence": { 
                  //TODO
                  this.Existence=Existences.native;
                  break; 
               }
               default: { 
                  //statements; 
                  break; 
               } 
            }
            //TODO - delete
            this.Existence=Existences.native;
			});
      //
      if(!this.BoardName) this.BoardName="Embedded device";
  }

  public async CreateChildElements(    
   ): Promise<void>{
      //create child elements
      this.Childs=[];      
      let element:IotItemTree_d;
      //
      if(this.BoardName){
         element = new IotItemTree_d("Board name",this.BoardName,this.BoardName,vscode.TreeItemCollapsibleState.None,this,this.Device);
         this.Childs.push(element);
      }
      element = new IotItemTree_d("Architecture",this.Architecture,this.Architecture,vscode.TreeItemCollapsibleState.None,this,this.Device);
      this.Childs.push(element);
      if(this.ArmbianVersion){
         element = new IotItemTree_d("Armbian",this.ArmbianVersion,this.ArmbianVersion,vscode.TreeItemCollapsibleState.None,this,this.Device);
         this.Childs.push(element);
      }
      if(this.BoardFamily){
         element = new IotItemTree_d("Board family",this.BoardFamily,this.BoardFamily,vscode.TreeItemCollapsibleState.None,this,this.Device);
         this.Childs.push(element);
      }
      if(this.LinuxFamily){
         element = new IotItemTree_d("Linux family",this.LinuxFamily,this.LinuxFamily,vscode.TreeItemCollapsibleState.None,this,this.Device);
         this.Childs.push(element);
      }
      element = new IotItemTree_d("Hostname",this.Hostname,this.Hostname,vscode.TreeItemCollapsibleState.None,this,this.Device);
      this.Childs.push(element);
      element = new IotItemTree_d("OS",this.OsDescription,this.OsDescription,vscode.TreeItemCollapsibleState.None,this,this.Device);
      this.Childs.push(element);
      element = new IotItemTree_d("Linux kernel",this.OsKernel,this.OsKernel,vscode.TreeItemCollapsibleState.None,this,this.Device);
      this.Childs.push(element);
      element = new IotItemTree_d("OS name",this.OsName,this.OsName,vscode.TreeItemCollapsibleState.None,this,this.Device);
      this.Childs.push(element);
      element = new IotItemTree_d("OS release",this.OsRelease,this.OsRelease,vscode.TreeItemCollapsibleState.None,this,this.Device);
      this.Childs.push(element);
      element = new IotItemTree_d("OS codename",this.OsCodename,this.OsCodename,vscode.TreeItemCollapsibleState.None,this,this.Device);
      this.Childs.push(element); 
   }

  
  Update(): void{
    console.log("Not Implemented");
  }

  iconPath = {
   light: path.join(__filename, '..', '..', 'resources', 'light', 'info_20.svg'),
   dark: path.join(__filename, '..', '..', 'resources', 'dark', 'info_20.svg')
 };
}

export enum Existences{ 
   none="None",
   native="Native",
   Docker="docker"
}
