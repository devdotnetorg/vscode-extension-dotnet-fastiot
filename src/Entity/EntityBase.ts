import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import StreamZip from 'node-stream-zip';
import {compare} from 'compare-versions';
import {EntityType} from './EntityType';
import {EntityBaseAttribute} from './EntityBaseAttribute';
import {MakeDirSync} from '../Helper/IoTHelper';
import {IotResult,StatusResult } from '../IotResult';
import { V1Options } from 'uuid';

export abstract class EntityBase<T extends EntityBaseAttribute> {
  protected _entityIntLabel:string; //for understandable log
  private _descFilePath:string=""; //YAML file
  public get DescriptionFilePath(): string {
    return this._descFilePath;}
  public get ParentDir(): string {
    return this._descFilePath.substring(0,this._descFilePath.lastIndexOf('/'));}
  public get ParentNameDir(): string {
    return this.ParentDir.substring(this.ParentDir.lastIndexOf('/'));}
  private _recoverySourcePath:string|undefined;
  public get RecoverySourcePath(): string|undefined {
      return this._recoverySourcePath;}
  //Validation
  public get IsValid(): boolean {
    if(this._validationErrors.length=0) return true;else return false;}
  protected _validationErrors:Array<string>=[]; 
  public get ValidationErrors(): Array<string> {
      return this._validationErrors;}
  //public Attributes: EntityBaseAttribute|undefined;
  public Attributes: T;
  public Type:EntityType=EntityType.none;

  constructor(entityIntLabel:string, attribute:T
    ){
      this._entityIntLabel=entityIntLabel;
      this.Attributes=attribute;
      //
      this._validationErrors.push("non");
  }

  public Init(type:EntityType,filePath:string,recoverySourcePath:string|undefined)
  {
    this.Type= type;
    this._recoverySourcePath=recoverySourcePath;
    this._descFilePath=filePath;
    this.Validation();
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
          `You need to rename the folder or change the ${this._entityIntLabel} id`);
    }else{
      //error
      this._validationErrors = attributes.ValidationErrors.slice();
    }
  }

  //abstract Parse(path:string):void;
  
  protected Validation(){
    this._validationErrors=[];
    if (!fs.existsSync(this._descFilePath)) 
      this._validationErrors.push(`${this._descFilePath} file does not exist`);
  }

  protected async UnpackFromZip(fileZipPath:string, unpackDir:string):Promise<IotResult> {
    let result:IotResult;
    try {
      const filename = fileZipPath.split('/').pop()?.substring(0,fileZipPath.split('/').pop()?.lastIndexOf('.'));
      unpackDir=unpackDir+"\\"+filename;
      //clear
      if (fs.existsSync(unpackDir)) fs.emptyDirSync(unpackDir);
      //mkdir
      MakeDirSync(unpackDir);
      //unpack
      const zip = new StreamZip.async({ file: fileZipPath });
      const count = await zip.extract(null, unpackDir);
      console.log(`Extracted ${count} entries`);
      await zip.close();
      result = new IotResult(StatusResult.Ok,undefined,undefined);
      result.returnObject=unpackDir;
    } catch (err: any){
      result = new IotResult(StatusResult.Error,`Error while unpacking file ${fileZipPath}`,err);
    }
    //result
    return Promise.resolve(result);
  }

  protected Move(destDir:string):IotResult {
    let result:IotResult;
    try {
      //clear
      if (fs.existsSync(destDir)) fs.emptyDirSync(destDir);
      //mkdir
      MakeDirSync(destDir);
      fs.moveSync(this.ParentDir,destDir);
      //replace fields
      this._descFilePath=`${destDir}\\${this.ParentNameDir}`;
      result = new IotResult(StatusResult.Ok,undefined,undefined);
    } catch (err: any){
      result = new IotResult(StatusResult.Error,`Unable to move ${this._entityIntLabel} from folder ${this.ParentDir} to folder ${destDir}`,err);
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
      //
      if(compare(version,this.Attributes.Version, '=')) return 0;
      if(compare(version, this.Attributes.Version, '>')) return 1;
    }
    return -1;
  }

  public async Recovery():Promise<IotResult>
  {
    let result:IotResult;
    const fileZipPath=`${this.RecoverySourcePath}\\${this.ParentNameDir}.zip`;
    result=await this.UnpackFromZip(fileZipPath,this.ParentDir);
    //result
    return Promise.resolve(result);
  }
}
