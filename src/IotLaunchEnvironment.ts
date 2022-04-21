import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {BaseTreeItem} from './BaseTreeItem';
import {IotDevice} from './IotDevice';
import {IotItemTree} from './IotItemTree';
import {IotConfiguration} from './IotConfiguration';
import {StatusResult,IotResult} from './IotResult';
import {IotLaunchConfiguration} from './IotLaunchConfiguration';

export class IotLaunchEnvironment extends BaseTreeItem{
  
  public Parent: IotLaunchConfiguration|IotLaunchEnvironment;
  public Childs: Array<IotLaunchEnvironment>=[];
  public Device: IotDevice| undefined;

  public Items:Map<string, string>=new Map<string, string>();

  public ConfigurationLaunch: IotLaunchConfiguration;    
    
  constructor(
    label: string,
    description: string|  undefined,
    tooltip: string | vscode.MarkdownString | undefined,
    collapsibleState: vscode.TreeItemCollapsibleState,    
    parent: IotLaunchConfiguration|IotLaunchEnvironment,    
    configurationLaunch: IotLaunchConfiguration    
  ){
    super(label,description,tooltip,collapsibleState);
    this.Parent=parent;
    this.ConfigurationLaunch=configurationLaunch;
    //view
    this.contextValue="iotenviroment";
  }
    
  public Add(key:string, value:string){
    this.Items.set(key,value);    
    this.ConfigurationLaunch.UpdateEnviroments();
    this.Build();
  }

  public Remove(key:string){
   this.Items.delete(key);   
   this.ConfigurationLaunch.UpdateEnviroments();
   this.Build();   
  }

  public Edit(key:string, newvalue:string){
    this.Items.set(key,newvalue);    
    this.ConfigurationLaunch.UpdateEnviroments();
    this.Build(); 
  }

  public Clear(){
    this.Items.clear();
  }

  public Build(){   
    this.CreateChildElements();
  }

  private CreateChildElements(){
    //create child elements
    this.Childs=[];      
    let element:IotLaunchEnvironment;
    //
    this.Items.forEach((value,key) => {      
      element = new IotLaunchEnvironment(key,value,value,vscode.TreeItemCollapsibleState.None,
        this,this.ConfigurationLaunch);
        element.iconPath = undefined;
        
        /*element.iconPath= {
          light: "",
          dark: ""
        };*/

      this.Childs.push(element);      
    });        
   }
  
  public Update(): void{
    console.log("Not Implemented");
  }

  public ToJSON():any{    
    //Fill
    const json="{}";
    let jsonObj = JSON.parse(json); 
    this.Items.forEach((value,key) => { 
      jsonObj[key]=value;      
    });  
    //    
    return jsonObj;    
  }

  public FromJSON(jsonObj:any):any{
    this.Clear();               
    //environments
    for (const key in jsonObj) {      
          const value=jsonObj[key];
          this.Add(key,value);        
    }
    //
    this.Build();
  }

  iconPath? = {
   light: path.join(__filename, '..', '..', 'resources', 'light', 'enviroment.svg'),
   dark: path.join(__filename, '..', '..', 'resources', 'dark', 'enviroment.svg')
 };
}
