import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class IoTGpiochip {
  private _id: number; 
  public get Id(): number { //Id=0
    return this._id;};
  private _name: string; 
  public get Name(): string { //Name=gpiochip0
    return this._name;};
  private _description: string;
  public get Description(): string { //Description=1f02c00.pinctrl
    return this._description;};
  private _numberLines: number; 
  public get NumberLines(): number { //NumberLines=32
    return this._numberLines;};
  //
  
  constructor(id:number, name: string,
      description: string,
      numberLines: number){
    this._id=id;
    this._name=name;
    this._description=description;
    this._numberLines=numberLines;
  };

  public Parse(text:string):void
  {
    //text=gpiochip0 [1f02c00.pinctrl] (32 lines)    
    const array1=text.split(' ');
    //Id    
    this._id=parseInt(array1[0].substring(8,undefined));
    //Name    
    this._name=array1[0];
    //Description    
    this._description=array1[1].substring(1,array1[1].length-1);
    //NumberLines;    
    this._numberLines=parseInt(array1[2].substring(1,undefined));
  }    
}
