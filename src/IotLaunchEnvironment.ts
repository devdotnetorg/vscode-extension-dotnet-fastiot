import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {BaseTreeItem} from './BaseTreeItem';
import {IotDevice} from './IotDevice';
import {IotItemTree} from './IotItemTree';
import {IotConfiguration} from './Configuration/IotConfiguration';
import {StatusResult,IotResult} from './IotResult';
import {IotLaunch} from './IotLaunch';
import {IoTHelper} from './Helper/IoTHelper';

export class IotLaunchEnvironment extends BaseTreeItem{
  
  public Parent: IotLaunch|IotLaunchEnvironment;
  public Childs: Array<IotLaunchEnvironment>=[];
  public Device: IotDevice| undefined;

  public Items:Map<string, string>=new Map<string, string>();

  public Launch: IotLaunch;    
    
  constructor(
    label: string,
    description: string|  undefined,
    tooltip: string | vscode.MarkdownString | undefined,
    collapsibleState: vscode.TreeItemCollapsibleState,    
    parent: IotLaunch|IotLaunchEnvironment,    
    launch: IotLaunch   
  ){
    super(label,description,tooltip,collapsibleState);
    this.Parent=parent;
    this.Launch=launch;
    //view
    this.contextValue="iotenviroment";
  }

  public WriteToFile(): boolean {  
    let result:boolean=false;
    //check launch.json
    const pathLaunchFile=<string>this.Launch.WorkspaceDirectory+"\\.vscode\\launch.json";
    if (!fs.existsSync(pathLaunchFile)) return result;
    //Change in file
    let datafile= fs.readFileSync(pathLaunchFile, 'utf8');
    datafile=IoTHelper.DeleteComments(datafile); 
    let jsonLaunch = JSON.parse(datafile);
    //    
    jsonLaunch.configurations.forEach((element:any) => {
      const fastiotId = element.fastiotIdLaunch;
      if(this.Launch.IdLaunch==fastiotId)
      {
        element.env=this.ToJSON();        
        result=true;
        //write file
        fs.writeFileSync(pathLaunchFile,JSON.stringify(jsonLaunch,null,2));
      }
    });
    return result;
  }

  public Add(key:string, value:string){
    this.Items.set(key,value);    
    this.Build();
  }

  public Remove(key:string){
   this.Items.delete(key);   
   this.Build();   
  }

  public Edit(key:string, newvalue:string){
    this.Items.set(key,newvalue);
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
        this,this.Launch);
        element.iconPath = undefined;
        
        /*element.iconPath= {
          light: "",
          dark: ""
        };*/

      this.Childs.push(element);      
    });        
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
