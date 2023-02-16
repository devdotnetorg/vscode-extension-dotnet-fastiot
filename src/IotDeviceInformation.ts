import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {BaseTreeItem} from './BaseTreeItem';
import {IotDevice} from './IotDevice';
import {IotItemTree} from './IotItemTree';
import {IotConfiguration} from './Configuration/IotConfiguration';
import {StatusResult,IotResult} from './IotResult';

export class IotDeviceInformation extends BaseTreeItem{  
   
  public Parent: IotDevice;
  public Childs: Array<IotItemTree>=[];
  public Device: IotDevice;

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
    parent: IotDevice,
    device: IotDevice    
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
      //Иногда с первого раза не устанавливается пакет в Ubuntu после его удаления
      //поэтому три попытки установить
      //1
      let result = await this.Client.RunScript(sshconfig,undefined, this.Device.Config.Folder.Extension,
          "pregetinformation",undefined, false,false);
      if(result.Status==StatusResult.Ok&&result.SystemMessage){
         this.Client.FireChangedState({
            status:undefined,
            console:result.SystemMessage,
            obj:undefined
          });
      }      
      //2
      if(result.Status==StatusResult.Error) {
         result = await this.Client.RunScript(sshconfig,undefined, this.Device.Config.Folder.Extension,
            "pregetinformation",undefined, false,false);
         if(result.Status==StatusResult.Ok&&result.SystemMessage){
            this.Client.FireChangedState({
               status:undefined,
               console:result.SystemMessage,
               obj:undefined
               });
         }
      }
      //3
      if(result.Status==StatusResult.Error) {
         result = await this.Client.RunScript(sshconfig,undefined, this.Device.Config.Folder.Extension,
            "pregetinformation",undefined, false,false);
         if(result.SystemMessage){
            this.Client.FireChangedState({
               status:undefined,
               console:result.SystemMessage,
               obj:undefined
               });
         }
      }
      //Result
      if(result.Status==StatusResult.Error) return Promise.resolve(result);
      //get information
      this.Client.FireChangedState({
         status:undefined,
         console:"Run: getinformation.sh",
         obj:undefined
       });
      result = await this.Client.RunScript(sshconfig,undefined, this.Device.Config.Folder.Extension,
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
      let element:IotItemTree;
      //
      if(this.BoardName){
         element = new IotItemTree("Board name",this.BoardName,this.BoardName,vscode.TreeItemCollapsibleState.None,this,this.Device);
         this.Childs.push(element);
      }
      element = new IotItemTree("Architecture",this.Architecture,this.Architecture,vscode.TreeItemCollapsibleState.None,this,this.Device);
      this.Childs.push(element);
      if(this.ArmbianVersion){
         element = new IotItemTree("Armbian",this.ArmbianVersion,this.ArmbianVersion,vscode.TreeItemCollapsibleState.None,this,this.Device);
         this.Childs.push(element);
      }
      if(this.BoardFamily){
         element = new IotItemTree("Board family",this.BoardFamily,this.BoardFamily,vscode.TreeItemCollapsibleState.None,this,this.Device);
         this.Childs.push(element);
      }
      if(this.LinuxFamily){
         element = new IotItemTree("Linux family",this.LinuxFamily,this.LinuxFamily,vscode.TreeItemCollapsibleState.None,this,this.Device);
         this.Childs.push(element);
      }
      element = new IotItemTree("Hostname",this.Hostname,this.Hostname,vscode.TreeItemCollapsibleState.None,this,this.Device);
      this.Childs.push(element);
      element = new IotItemTree("OS",this.OsDescription,this.OsDescription,vscode.TreeItemCollapsibleState.None,this,this.Device);
      this.Childs.push(element);
      element = new IotItemTree("Linux kernel",this.OsKernel,this.OsKernel,vscode.TreeItemCollapsibleState.None,this,this.Device);
      this.Childs.push(element);
      element = new IotItemTree("OS name",this.OsName,this.OsName,vscode.TreeItemCollapsibleState.None,this,this.Device);
      this.Childs.push(element);
      element = new IotItemTree("OS release",this.OsRelease,this.OsRelease,vscode.TreeItemCollapsibleState.None,this,this.Device);
      this.Childs.push(element);
      element = new IotItemTree("OS codename",this.OsCodename,this.OsCodename,vscode.TreeItemCollapsibleState.None,this,this.Device);
      this.Childs.push(element); 
   }

  
  Update(): void{
    console.log("Not Implemented");
  }

  iconPath = {
   light: path.join(__filename, '..', '..', 'resources', 'light', 'info.svg'),
   dark: path.join(__filename, '..', '..', 'resources', 'dark', 'info.svg')
 };
}

export enum Existences{ 
   none="None",
   native="Native",
   Docker="docker"
}
