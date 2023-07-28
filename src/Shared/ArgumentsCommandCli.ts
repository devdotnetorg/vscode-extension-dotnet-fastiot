import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IoTHelper } from '../Helper/IoTHelper';

export class ArgumentsCommandCli {

  private _arguments:Map<string,string>;
  public SymbolBeginArgument:string = "--"

  constructor(){
      this._arguments=new Map<string,string>();
    }

  public AddArgument(name:string, value:string) {
    name=IoTHelper.StringTrim(name);
    value=IoTHelper.StringTrim(value);
    this._arguments.set(name,value);
  }

  public toString():string {
    let result:string="";
    this._arguments.forEach((value, key) => {
      result=`${result} ${this.SymbolBeginArgument}${key} ${value}`;
    });
    result=IoTHelper.StringTrim(result);
    return result;
  }
 }
  