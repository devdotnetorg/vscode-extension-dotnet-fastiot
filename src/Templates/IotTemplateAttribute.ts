import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import YAML from 'yaml';

import {EntityType} from '../Entity/EntityType';
import {EntityBase} from '../Entity/EntityBase';
import {EntityBaseAttribute} from '../Entity/EntityBaseAttribute';

export class IotTemplateAttribute extends EntityBaseAttribute {
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
  private _fileNameReplacement:Array<string>=[]; 
  public get FileNameReplacement(): Array<string> {
    return this._fileNameReplacement;}

  constructor(
    ){
      super();
  }

  public Init(filePath:string)
  {
    //Base Init 
    super.Validation();
    if(super.IsValid) super.Parse(filePath);
    //
    if(!this.IsValid) return;
    //next
    this.Validation();
    if(this.IsValid) this.Parse(filePath);
  }

  protected Validation(){
    this._validationErrors=[];
  }

  protected Parse(filePath:string){
    try {
      const file = fs.readFileSync(filePath, 'utf8');
      const obj=YAML.parse(file);
      //one value
      this._typeProj=obj.typeProj;
      this._projName=obj.projName;
      this._mainFileProj=obj.mainFileProj;
      this._mainFileProjLabel=obj.mainFileProjLabel;
      //arrays
      let index=0; 
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
  } catch (err: any){
      this._validationErrors.push(`File: ${filePath} Error parsing attributes: ${err}`);
    }
  }

}