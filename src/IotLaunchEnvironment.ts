import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IotResult,StatusResult } from './Shared/IotResult';

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
  public Rename(oldkey:string, newkey:string) {
    const oldValue=this.Items.get(oldkey);
    if (!oldValue) return;
    this.Remove(oldkey);
    this.Add(newkey,oldValue); 
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
