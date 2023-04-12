import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import YAML from 'yaml';

import { EntityBaseAttribute } from '../Entity/EntityBaseAttribute';
import { IoTHelper } from '../Helper/IoTHelper';
import { YamlSchemaValidator } from '../Validator/YamlSchemaValidator';

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
  private _fileNameReplacement:Map<string,string>= new Map<string,string>();
  public get FileNameReplacement():Map<string,string> {
    return this._fileNameReplacement;}
  public get ExtMainFileProj():string {
    //dotnetapp.csproj => .csproj
    return IoTHelper.GetFileExtensions(this.MainFileProj);}
  
  constructor(schemasFolderPath: string|undefined = undefined
    ){
      super(schemasFolderPath);
  }

  public Init(filePath:string)
  {
    //Base Init 
    super.Parse(filePath);
    //
    if(!this.IsValid) return;
    //next
    this.Validate(filePath);
    if(this.IsValid) this.Parse(filePath);
  }

  protected Validate(yamlFilePath:string){
    this._validationErrors=[];
    //YamlSchemaValidator
    let yamlSchemaValidator=new YamlSchemaValidator(this._schemasFolderPath);
    let result = yamlSchemaValidator.ValidateSchema(yamlFilePath,"template.schema.yaml");
    const validationErrors=<Array<string>>result.returnObject;
    this._validationErrors = validationErrors.slice();
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
      this._validationErrors.push(`File: ${filePath} Error parsing attributes: ${err}`);
    }
  }
}