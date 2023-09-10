import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import YAML from 'yaml';
import { EntityBaseAttribute } from '../Entity/EntityBaseAttribute';
import { IoTHelper } from '../Helper/IoTHelper';

export class IotTemplateAttribute extends EntityBaseAttribute {
  private _language:string="";  
  public get Language(): string {
    return this._language;}
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
  private _filesToProcess:Array<string>=[]; 
  public get FilesToProcess(): Array<string> {
    return this._filesToProcess;}
  private _fileNameReplacement:Map<string,string>= new Map<string,string>();
  public get FileNameReplacement():Map<string,string> {
    return this._fileNameReplacement;}
  public get ExtMainFileProj():string {
    //dotnetapp.csproj => .csproj
    return IoTHelper.GetFileExtensions(this.MainFileProj);}
  
  constructor(pathFolderSchema:string,fileNameSchemaRootYaml:string){
      super(pathFolderSchema,fileNameSchemaRootYaml);
  }

  public Init(yamlFilePath:string):boolean
  {
    //Init
    return this.Parse(yamlFilePath);
  }

  private Validate(yamlFilePath:string){
    this._validationErrors=[];
    //custom Validator

  }

  private Parse(yamlFilePath:string):boolean{
    try {
      //validate
      this.Validate(yamlFilePath);
      if(!this.IsValid) return false;
      //
      const file = fs.readFileSync(yamlFilePath, 'utf8');
      const obj=YAML.parse(file);
      //one value
      this._language=obj.language;
      this._typeProj=obj.typeProj;
      this._projName=obj.projName;
      this._mainFileProj=obj.mainFileProj;
      this._mainFileProjLabel=obj.mainFileProjLabel;
      //arrays
      let index=0; 
      //filesToProcess
      this._filesToProcess=[];
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
      this._fileNameReplacement= new Map<string,string>();
      index=0;
      do { 				
            let item=obj.fileNameReplacement[index];
            if(item) {
              const values=(<string>item).split('=');
              const key=values[0];
              const value=values[1];
              this._fileNameReplacement.set(key,value);          
              //next position
              index=index+1;
            }else break;      
      } 
      while(true)
      //next
    } catch (err: any){
      this._validationErrors.push(`File: ${yamlFilePath} Error parsing attributes: ${err}`);
    }
    return this.IsValid;
  }
}