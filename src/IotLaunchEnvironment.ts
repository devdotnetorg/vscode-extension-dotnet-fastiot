import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {StatusResult,IotResult} from './IotResult';

export class IotLaunchEnvironment {
  
  private _items:Map<string, string>;
  public get Items(): Map<string, string> {
    return this._items;}

  constructor(
  ){
    this._items=new Map<string, string>();
  }

  public Add = (key:string, value:string) => this.Items.set(key,value);
  public Remove(key:string) {
    if(this.Items.has(key)) this.Items.delete(key);
  }
  public Edit = (key:string, newvalue:string) => this.Items.set(key,newvalue);
  public Clear = () => this.Items.clear();

  public ToJSON():any{    
    //Fill
    const json="{}";
    let jsonObj = JSON.parse(json); 
    this.Items.forEach((value,key) => { 
      jsonObj[key]=value;      
    }); 
    return jsonObj;    
  }

  public FromJSON(jsonObj:any):any{
    this.Clear();               
    //environments
    for (const key in jsonObj) {      
          const value=jsonObj[key];
          this.Add(key,value);        
    }
  }

}
