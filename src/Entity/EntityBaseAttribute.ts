import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import YAML from 'yaml';
import { YamlValidatorRedHat } from '../Validator/YamlValidatorRedHat';
import { IYamlValidator } from '../Validator/IYamlValidator';

export class EntityBaseAttribute {
  private _id:string="";  
  public get Id(): string {
    return this._id;}
  private _version:string="";  
  public get Version(): string {
    return this._version;}
  private _platform:Array<string>=[];  
  public get platform(): Array<string> {
    return this._platform;}
  private _releaseDate:Date=new Date();  
  public get ReleaseDate(): Date {
    return this._releaseDate;}
  private _forVersionExt:string="";  
  public get ForVersionExt(): string {
    return this._forVersionExt;}
  private _author:string="";  
  public get Author(): string {
    return this._author;}
  public Label: string="";
  private _detail:string="";  
  public get Detail(): string {
    return this._detail;}
  private _description:string="";  
  public get Description(): string {
    return this._description;}
  private _language:string="";  
  public get Language(): string {
    return this._language;}
  private _endDeviceArchitecture:Array<string>=[]; 
  public get EndDeviceArchitecture(): Array<string> {
    return this._endDeviceArchitecture;}
  private _tags:Array<string>=[]; 
  public get Tags(): Array<string> {
    return this._tags;}
  //Validation
  protected get IsValid(): boolean {
    if(this._validationErrors.length==0) return true;else return false;}
  protected _validationErrors:Array<string>=[]; 
  public get ValidationErrors(): Array<string> {
      return this._validationErrors;}

  protected readonly _pathFolderSchema: string;
  protected readonly _fileNameSchemaRootYaml: string;

  constructor(pathFolderSchema:string,fileNameSchemaRootYaml:string
    ){
      this._pathFolderSchema=pathFolderSchema;
      this._fileNameSchemaRootYaml=fileNameSchemaRootYaml;
      this._validationErrors.push("non");
    }

  public InitBaseAttribute(yamlFilePath:string):boolean
  {
    let result:boolean;
    result=this.ParseBaseAttribute(yamlFilePath);
    if(!result) false;
    result=this.PostCheckAfterParse(yamlFilePath);
    //
    return  result;
  }

  private ParseBaseAttribute(yamlFilePath:string):boolean{
    try {
      //validate
      this.ValidateBaseAttribute(yamlFilePath);
      if(!this.IsValid) return false;
      //
      const file = fs.readFileSync(yamlFilePath, 'utf8');
      const obj=YAML.parse(file);
      //one value
      this._id=obj.id;
      this._version=obj.version;
      this._releaseDate=new Date(obj.releaseDate);
      this._forVersionExt=obj.forVersionExt;
      this._author=obj.author;
      this.Label=obj.label;
      this._detail=obj.detail;
      this._description=obj.description;
      this._language=obj.language;
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
      //next
    } catch (err: any){
      this._validationErrors.push(`File: ${yamlFilePath} Error parsing attributes: ${err}`);
    }
    return this.IsValid;
  }

  private PostCheckAfterParse(yamlFilePath:string):boolean{
    try {
      //check id=""
      if (this.Id=="") this._validationErrors.push("id cannot be empty");
    } catch (err: any){
      this._validationErrors.push(`File: ${yamlFilePath} Error PostCheckAfterParce: ${err}`);
    }
    return this.IsValid;
  }

  private ValidateBaseAttribute(yamlFilePath:string)
  {
    this._validationErrors=[];
    //exist
    if (!fs.existsSync(yamlFilePath))
    {
      this._validationErrors.push(`${yamlFilePath} file does not exist`);
      return;
    }
    //YamlValidator
    let yamlValidator:IYamlValidator=new YamlValidatorRedHat(this._pathFolderSchema);
    let result = yamlValidator.ValidateSchema(yamlFilePath,this._fileNameSchemaRootYaml);
    const validationErrors=<Array<string>>result.returnObject;
    this._validationErrors = validationErrors.slice();
  }

  public ForceGetID(filePath:string):string|undefined
  {
    if(!fs.existsSync(filePath)) return undefined;
    try {
      const file = fs.readFileSync(filePath, 'utf8');
      const obj=YAML.parse(file);
      //one value
      const id=<string>obj.id;
      return id;
    } catch (err: any){
      return undefined;
    }
  }

}
