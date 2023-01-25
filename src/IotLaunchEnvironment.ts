import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {BaseTreeItem} from './BaseTreeItem';
import {IotDevice} from './IotDevice';
import {IotItemTree} from './IotItemTree';
import {IotConfiguration} from './Configuration/IotConfiguration';
import {StatusResult,IotResult} from './IotResult';
import {IotLaunch} from './IotLaunch';

export class IotLaunchEnvironment extends BaseTreeItem{
  
  public Parent: IotLaunch|IotLaunchEnvironment;
  public Childs: Array<IotLaunchEnvironment>=[];
  public Device: IotDevice| undefined;

  public Items:Map<string, string>=new Map<string, string>();

  public ConfigurationLaunch: IotLaunch;    
    
  constructor(
    label: string,
    description: string|  undefined,
    tooltip: string | vscode.MarkdownString | undefined,
    collapsibleState: vscode.TreeItemCollapsibleState,    
    parent: IotLaunch|IotLaunchEnvironment,    
    configurationLaunch: IotLaunch   
  ){
    super(label,description,tooltip,collapsibleState);
    this.Parent=parent;
    this.ConfigurationLaunch=configurationLaunch;
    //view
    this.contextValue="iotenviroment";
  }
  //DELL
  public Add(key:string, value:string){
    this.Items.set(key,value);    
    this.ConfigurationLaunch.UpdateEnviroments();
    this.Build();
  }
  //DELL
  public Remove(key:string){
   this.Items.delete(key);   
   this.ConfigurationLaunch.UpdateEnviroments();
   this.Build();   
  }
  //DELL
  public Edit(key:string, newvalue:string){
    this.Items.set(key,newvalue);    
    this.ConfigurationLaunch.UpdateEnviroments();
    this.Build(); 
  }
  //DELL
  public Clear(){
    this.Items.clear();
  }
  //DELL
  public Build(){   
    this.CreateChildElements();
  }
  //DELL
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
  //DELL
  public Update(): void{
    console.log("Not Implemented");
  }
  //DELL
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
  //DELL
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
