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
import {GetUniqueLabel,MakeDirSync,MergeWithDictionary,DeleteComments} from './Helper/IoTHelper';

export class IotTemplate {
  private _path:string  
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
  //YAML file attributes
  public Attributes: IotTemplateAttribute; 

  constructor(path:string
    ){
      this._path=path;
      this.Validation();
      this.Attributes= new IotTemplateAttribute(this.YAMLDescriptionPath);  
    }
  
  private Validation()
  {
    if (!fs.existsSync(this.Path)) {
      throw new Error(`${this.Path} folder does not exist`);
    }
    if (!fs.existsSync(this.AppsPath)) {
      throw new Error(`${this.AppsPath} folder does not exist`);
    }
    if (!fs.existsSync(this.TemplatePath)) {
      throw new Error(`${this.TemplatePath} folder does not exist`);
    }
    if (!fs.existsSync(this.ImagePath)) {
      throw new Error(`${this.ImagePath} file does not exist`);
    }
    if (!fs.existsSync(this.YAMLDescriptionPath)) {
      throw new Error(`${this.YAMLDescriptionPath} file does not exist`);
    }
  }
}
