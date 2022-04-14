import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {BaseTreeItem} from './BaseTreeItem';
import {IotDevice} from './IotDevice';
import {IotItemTree} from './IotItemTree';
import {IotConfiguration} from './IotConfiguration';
import {StatusResult,IotResult} from './IotResult';
import {IotLaunchConfiguration} from './IotLaunchConfiguration';
import {MakeDirSync,ReverseSeparatorReplacement,ReverseSeparatorWinToLinux,GetDotnetRID} from './Helper/IoTHelper';
//

export class IotLaunchOptions extends BaseTreeItem{  
  public Parent: BaseTreeItem| any| undefined;
  public Childs: Array<IotItemTree>=[];
  public Device: IotDevice| undefined;

  public MergeDictionary:Map<string,string>= new Map<string,string>();

  private _targetFramework:string|undefined;
  public get TargetFramework(): string|undefined {
    return this._targetFramework;}    

  private _platform:string|undefined;
  public get Platform(): string|undefined {
    return this._platform;}    

  public ConfigurationLaunch: IotLaunchConfiguration;    
  
  constructor(
    label: string,
    description: string|  undefined,
    tooltip: string|  undefined,
    collapsibleState: vscode.TreeItemCollapsibleState,
    parent: IotLaunchConfiguration| IotLaunchOptions,
    configurationLaunch: IotLaunchConfiguration,
    device: IotDevice|  undefined    
  ){
    super(label,description,tooltip,collapsibleState);
    this.Parent=parent;    
    this.Device=device;
    this.ConfigurationLaunch=configurationLaunch;
  }

  public Build(){
    //read *.csproj for get TargetFramework
    const xmlFile:string= fs.readFileSync(<string>this.ConfigurationLaunch.Project.FullPath, 'utf8');
    let xpath = require('xpath');
    let dom = require('xmldom').DOMParser;
    let doc = new dom().parseFromString(xmlFile);
    let nodes = xpath.select("//TargetFramework", doc);
    this._targetFramework=nodes[0].firstChild.data;
    //Platform
    //NET RID Catalog
    this._platform=GetDotnetRID(<string>this.Device?.Information.OsName,<string>this.Device?.Information.Architecture);
    //Create Map
    this.CreatingMergeDictionary ();
    //Create childs
    this.CreateChildElements();
  }

  private CreatingMergeDictionary () {        
    this.MergeDictionary.clear();
    //
    this.MergeDictionary.set("%TARGET_FRAMEWORK%",<string>this.TargetFramework);
    this.MergeDictionary.set("%NAME_PROJECT%",<string>this.ConfigurationLaunch.Project.Name);
    this.MergeDictionary.set("%FASTID%",this.ConfigurationLaunch.IdConfiguration);
    this.MergeDictionary.set("%FASTID_DEVICE%",<string>this.Device?.IdDevice);    
    const path_project=<string>this.ConfigurationLaunch.Project.RelativePath;
    let path_project_double=ReverseSeparatorReplacement(path_project);
    this.MergeDictionary.set("%PATH_PROJECT%",path_project_double);
    let path_project_win_to_linux=ReverseSeparatorWinToLinux(path_project);
    this.MergeDictionary.set("%PATH_PROJECT_REVERSE%",path_project_win_to_linux);
    this.MergeDictionary.set("%NAME%",<string>this.ConfigurationLaunch.label);
    let pipe_program=this.ConfigurationLaunch.Config.PathFoldercwRsync+"\\ssh.exe";
    pipe_program=ReverseSeparatorReplacement(pipe_program);
    this.MergeDictionary.set("%PIPEPROGRAM%",pipe_program);
    let rsync_program=this.ConfigurationLaunch.Config.PathFoldercwRsync+"\\rsync.exe";
    rsync_program=ReverseSeparatorReplacement(rsync_program);
    this.MergeDictionary.set("%RSYNCPROGRAM%",rsync_program);    
    let ssh_key=this.ConfigurationLaunch.Config.AccountPathFolderKeys+"\\"+<string>this.Device?.Account.Identity;
    ssh_key=ReverseSeparatorReplacement(ssh_key);
    this.MergeDictionary.set("%SSH_KEY%",ssh_key);
    this.MergeDictionary.set("%USER_DEBUG%",<string>this.Device?.Account.UserName);
    this.MergeDictionary.set("%REMOTE_HOST%",<string>this.Device?.Account.Host);
    //22
    this.MergeDictionary.set("%REMOTE_PORT%",<string>this.Device?.Account.Port);
    //
    this.MergeDictionary.set("%DEVICE_LABEL%",<string>this.Device?.label);
    this.MergeDictionary.set("%BOARD_NAME%",<string>this.Device?.Information.BoardName);
    //
    this.MergeDictionary.set("%CY_PATH_PROJECT%",<string>this.ConfigurationLaunch.Project.CyPath);
    this.MergeDictionary.set("%PLATFORM%",<string>this.ConfigurationLaunch.Options.Platform);    
    let relativeFolderPath="";
    if(this.ConfigurationLaunch.Project.RelativeFolderPath!=".")
    {
      relativeFolderPath= "\\"+<string>this.ConfigurationLaunch.Project.RelativeFolderPath;
      relativeFolderPath=ReverseSeparatorWinToLinux(relativeFolderPath);
    }    
    this.MergeDictionary.set("%RELATIVE_FOLDER_PATH%",relativeFolderPath);
  }

  private CreateChildElements()
  {
      //create child elements
      this.Childs=[];      
      let element:IotItemTree;
      //      
      element = new IotItemTree("Project",this.ConfigurationLaunch.Project.RelativePath,
        this.ConfigurationLaunch.Project.RelativePath,
        vscode.TreeItemCollapsibleState.None,this,<IotDevice>this.Device);
      this.Childs.push(element);      
      element = new IotItemTree("Id device",this.Device?.IdDevice,this.Device?.IdDevice,
        vscode.TreeItemCollapsibleState.None,this,<IotDevice>this.Device);
      this.Childs.push(element);    
      element = new IotItemTree("Username",this.Device?.Account.UserName,this.Device?.Account.UserName,
        vscode.TreeItemCollapsibleState.None,this,<IotDevice>this.Device);
      this.Childs.push(element);          
      //
      if(this.TargetFramework){
         element = new IotItemTree("Target Framework",this.TargetFramework,this.TargetFramework,
          vscode.TreeItemCollapsibleState.None,this,<IotDevice>this.Device);
         this.Childs.push(element);
      }     
      if(this.Platform){
        element = new IotItemTree("RID",this.Platform,this.Platform,
        vscode.TreeItemCollapsibleState.None,this,<IotDevice>this.Device);
        this.Childs.push(element);
     }
     //
   }

  
  public Update(): void{
    console.log("Not Implemented");
  }

  iconPath = {
   light: path.join(__filename, '..', '..', 'resources', 'light', 'info.svg'),
   dark: path.join(__filename, '..', '..', 'resources', 'dark', 'info.svg')
 };
}
