import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import {compare} from 'compare-versions';
import {EntityType} from './EntityType';
import {EntityBaseAttribute} from './EntityBaseAttribute';
import {IoTHelper} from '../Helper/IoTHelper';
import {IotResult,StatusResult } from '../IotResult';

export abstract class EntityBase<T extends EntityBaseAttribute> {
  protected _entityIntLabel:string; //for understandable log
  private _descFilePath:string=""; //YAML file
  public get DescriptionFilePath(): string {
    return this._descFilePath;}
  public get ParentDir(): string {
    return path.dirname(this._descFilePath);}
  public get ParentNameDir(): string|undefined {
    return path.dirname(this._descFilePath).split(path.sep).pop();}
  private _recoverySourcePath:string|undefined;
  public get RecoverySourcePath(): string|undefined {
      return this._recoverySourcePath;}
  //Validation
  public get IsValid(): boolean {
    if(this._validationErrors.length==0) return true;else return false;}
  protected _validationErrors:Array<string>=[]; 
  public get ValidationErrors(): Array<string> {
      return this._validationErrors;}
  //public Attributes: EntityBaseAttribute|undefined;
  public Attributes: T;
  public Type:EntityType=EntityType.none;

  protected _pathFolderSchemas: string;

  constructor(entityIntLabel:string, attribute:T,pathFolderSchemas: string
    ){
      this._entityIntLabel=entityIntLabel;
      this.Attributes=attribute;
      //
      this._pathFolderSchemas=pathFolderSchemas;
      this._validationErrors.push("non");
  }

  public Init(type:EntityType,filePath:string,recoverySourcePath:string|undefined)
  {
    this.Type= type;
    this._recoverySourcePath=recoverySourcePath;
    this._descFilePath=filePath;
    this.ValidateEntityBase();
    if(!this.IsValid) return;
    //if(this.IsValid) this.Parse(path);
    let attributes = this.Attributes as any; 
    attributes.Init(this._descFilePath);
    if(attributes.IsValid)
    {
      //ok
      //check if folder matches entity and id
      if(this.ParentNameDir!=attributes.Id)
        this._validationErrors.push(`${this._entityIntLabel} folder name ${this.ParentNameDir} `+
          `does not match id value ${attributes.Id}.`+
          `You need to rename the folder or change the ${this._entityIntLabel} id.`);
    }else{
      //error
      this._validationErrors = attributes.ValidationErrors.slice();
    }
  }
  
  private ValidateEntityBase(){
    this._validationErrors=[];
    if (!fs.existsSync(this._descFilePath)) 
      this._validationErrors.push(`${this._descFilePath} file does not exist`);
  }

  public Move(destDir:string):IotResult {
    let result:IotResult;
    try {
      //delete
      if (fs.existsSync(destDir))
      {
        fs.emptyDirSync(destDir);
        fs.removeSync(destDir);
      } 
      //destDir - no need to create a folder 
      fs.moveSync(this.ParentDir,destDir);
      //replace fields
      const fileName=this._descFilePath.substring(this.ParentDir.length+1);
      this._descFilePath= path.join(destDir, fileName);
      result = new IotResult(StatusResult.Ok,undefined,undefined);
    } catch (err: any){
      result = new IotResult(StatusResult.Error,`Unable to move ${this._entityIntLabel} from folder ${this.ParentDir} to folder ${destDir}`,err);
    }
    //result
    return result;
  }

  public Remove ():IotResult {
    let result:IotResult;
    try {
      //delete
      if (fs.existsSync(this.ParentDir))
      {
        fs.emptyDirSync(this.ParentDir);
        fs.removeSync(this.ParentDir);
      } 
      result = new IotResult(StatusResult.Ok,`Folder has been deleted: ${this.ParentDir}`);
    } catch (err: any){
      result = new IotResult(StatusResult.Error,`Unable to delete template folder: ${this.ParentDir}`,err);
    }
    //result
    return result;
  }

  public Compare1(entityBase:EntityBase<T>):number{
    //0 - equal, 1 - entityBase up, -1 - entityBase down
    return this.Compare2(entityBase.Type,entityBase.Attributes.Version);
  }

  public Compare2(type:EntityType, version:string):number{
    //0 - equal, 1 - entityBase up, -1 - entityBase down
    if(type==this.Type){
      if(compare(`${version}`,`${this.Attributes.Version}`, '=')) return 0;
      if(compare(`${version}`,`${this.Attributes.Version}`, '>')) return 1;
    }
    return -1;
  }

  public Recovery():IotResult
  {
    let result:IotResult;
    const fileZipPath=`${this.RecoverySourcePath}\\${this.ParentNameDir}.zip`;
    result= IoTHelper.UnpackFromZip(fileZipPath,path.dirname(this.ParentDir));
    //result
    return result;
  }

  public IsCompatible1(endDeviceArchitecture:string|undefined):boolean
  {
    const result=this.Attributes.EndDeviceArchitecture.find(x=>x==endDeviceArchitecture);
    if(result) return true; else  return false;
  }
}
