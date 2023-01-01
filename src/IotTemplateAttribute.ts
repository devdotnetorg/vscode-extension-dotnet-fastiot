import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import YAML from 'yaml'
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

import {GetUniqueLabel,MakeDirSync,MergeWithDictionary,DeleteComments} from './Helper/IoTHelper';
//

export class IotTemplateAttribute {
  private _id:string="";  
  public get Id(): string {
    return this._id;}
  private _platform:Array<string>=[];  
  public get platform(): Array<string> {
    return this._platform;}
  private _version:string="";  
  public get Version(): string {
    return this._version;}
  private _releaseDate:Date=new Date();  
  public get ReleaseDate(): Date {
    return this._releaseDate;}
  private _author:string="";  
  public get Author(): string {
    return this._author;}
  private _label:string="";  
  public get Label(): string {
    return this._label;}
  private _detail:string="";  
  public get Detail(): string {
    return this._detail;}
  private _language:string="";  
  public get Language(): string {
    return this._language;}
  private _endDeviceArchitecture:Array<string>=[]; 
  public get EndDeviceArchitecture(): Array<string> {
    return this._endDeviceArchitecture;}
  private _dependOnPackages:Array<string>=[]; 
  public get DependOnPackages(): Array<string> {
    return this._dependOnPackages;}
  private _typeProj:string="";  
  public get TypeProj(): string {
    return this._typeProj;}
  private _projName:string="";  
  public get ProjName(): string {
    return this._projName;}
  private _mainFileProj:string="";  
  public get MainFileProj(): string {
    return this._mainFileProj;}
  private _mainFileProjLabel:string="";  
  public get MainFileProjLabel(): string {
    return this._mainFileProjLabel;}
  private _tags:Array<string>=[]; 
  public get Tags(): Array<string> {
    return this._tags;}
  private _filesToProcess:Array<string>=[]; 
  public get FilesToProcess(): Array<string> {
    return this._filesToProcess;}
  private _fileNameReplacement:Array<string>=[]; 
  public get FileNameReplacement(): Array<string> {
    return this._fileNameReplacement;}
  //Validation
  private _isValid:boolean=false;
  public get IsValid(): boolean {
    return this._isValid;}
  private _validationErrors:Array<string>=[]; 
  public get ValidationErrors(): Array<string> {
      return this._validationErrors;}

  constructor(path:string
    ){
      this.Validation();
      if(this.IsValid) this.Parse(path);
    }

  private Parse(path:string)
  {
    const file = fs.readFileSync(path, 'utf8');
    const obj=YAML.parse(file);
    //one value
    this._id=obj.id;
    this._version=obj.version;
    this._releaseDate=new Date(obj.releaseDate);
    this._author=obj.author;
    this._label=obj.label;
    this._detail=obj.detail;
    this._language=obj.language;
    this._typeProj=obj.typeProj;
    this._projName=obj.projName;
    this._mainFileProj=obj.mainFileProj;
    this._mainFileProjLabel=obj.mainFileProjLabel;
    //arrays
    let index=0; 
    //platform
    index=0;
    do { 				
          let item=obj.platform[index];
          if(item) {
            this._platform.push(<string>item);            
            //next position
            index=index+1;
          }else break;      
    } 
    while(true)
    //endDeviceArchitecture
    index=0;
    do { 				
          let item=obj.endDeviceArchitecture[index];
          if(item) {
            this._endDeviceArchitecture.push(<string>item);            
            //next position
            index=index+1;
          }else break;      
    } 
    while(true)
    //dependOnPackages
    index=0;
    do { 				
          let item=obj.dependOnPackages[index];
          if(item) {
            this._dependOnPackages.push(<string>item);            
            //next position
            index=index+1;
          }else break;      
    } 
    while(true)
    //tags
    index=0;
    do { 				
          let item=obj.tags[index];
          if(item) {
            this._tags.push(<string>item);            
            //next position
            index=index+1;
          }else break;      
    } 
    while(true)
    //filesToProcess
    index=0;
    do { 				
          let item=obj.filesToProcess[index];
          if(item) {
            this._filesToProcess.push(<string>item);            
            //next position
            index=index+1;
          }else break;      
    } 
    while(true)
    //fileNameReplacement
    index=0;
    do { 				
          let item=obj.fileNameReplacement[index];
          if(item) {
            this._fileNameReplacement.push(<string>item);            
            //next position
            index=index+1;
          }else break;      
    } 
    while(true)
    //next

  }
  
  // TODO: do validation
  private Validation()
  {

    //result
    if(this._validationErrors.length=0) this._isValid=true;
  }

}
