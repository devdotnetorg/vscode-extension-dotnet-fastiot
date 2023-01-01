import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {BaseTreeItem} from './BaseTreeItem';
import {IotDeviceAccount} from './IotDeviceAccount';
import {IotDeviceInformation} from './IotDeviceInformation';
 
import {IotConfiguration } from './IotConfiguration';
import {IotResult,StatusResult } from './IotResult';
import {v4 as uuidv4} from 'uuid';
import {IotItemTree } from './IotItemTree';
import { config } from 'process';
import SSH2Promise from 'ssh2-promise';
import {IotDevice} from './IotDevice';
import {IotLaunchOptions} from './IotLaunchOptions';
import {IotLaunchEnvironment} from './IotLaunchEnvironment';
import {IotLaunchProject} from './IotLaunchProject';
import {IotTemplateAttribute} from './IotTemplateAttribute';
import {EntityType,GetUniqueLabel,MakeDirSync,MergeWithDictionary,DeleteComments} from './Helper/IoTHelper';

export class IotTemplate {
  private _path:string;
  public get Path(): string {
    return this._path;}
  public get AppsPath(): string {
    return this._path+"\\apps";}
  public get TemplatePath(): string {
    return this._path+"\\template";}
  public get ImagePath(): string {
    return this._path+"\\template.fastiot.png";}
  public get YAMLDescriptionPath(): string {
      return this._path+"\\template.fastiot.yaml";}
  //Validation
  private _isValid:boolean=false;
  public get IsValid(): boolean {
    return this._isValid;}
  private _validationErrors:Array<string>=[]; 
  public get ValidationErrors(): Array<string> {
      return this._validationErrors;}
  //YAML file attributes
  public Attributes: IotTemplateAttribute; 
  public Type:EntityType=EntityType.none;

  constructor(path:string,type:EntityType
    ){
      this._path=path;
      this.Attributes= new IotTemplateAttribute(this.YAMLDescriptionPath);
      if(!this.Attributes.IsValid) 
        this._validationErrors = this.Attributes.ValidationErrors.slice();
      this.Validation();
      //
      if(this.IsValid){
        this.Type= type;
      }
    }
  
  private Validation()
  {
    if (!fs.existsSync(this.Path)) 
      this._validationErrors.push(`${this.Path} folder does not exist`);
    if (!fs.existsSync(this.AppsPath)) 
      this._validationErrors.push(`${this.AppsPath} folder does not exist`);
    if (!fs.existsSync(this.TemplatePath)) 
      this._validationErrors.push(`${this.TemplatePath} folder does not exist`);
    if (!fs.existsSync(this.ImagePath)) 
      this._validationErrors.push(`${this.ImagePath} file does not exist`);
    if (!fs.existsSync(this.YAMLDescriptionPath)) 
      this._validationErrors.push(`${this.YAMLDescriptionPath} file does not exist`);
    //result
    if(this._validationErrors.length=0) this._isValid=true;
  }
}


