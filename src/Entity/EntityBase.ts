import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import {compare} from 'compare-versions';
import {EntityType} from './EntityType';
import {EntityBaseAttribute} from './EntityBaseAttribute';
import {IoTHelper} from '../Helper/IoTHelper';
import {IotResult,StatusResult } from '../IotResult';
import { V1Options } from 'uuid';

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

  protected UnpackFromZip(fileZipPath:string, unpackDir:string):IotResult {
    let result:IotResult;
    try {
      let filename = path.basename(fileZipPath);
      filename=filename.substring(0,filename.length-4);
      unpackDir=unpackDir+"\\"+filename;
      //clear
      if (fs.existsSync(unpackDir)) fs.emptyDirSync(unpackDir);
      //mkdir
      IoTHelper.MakeDirSync(unpackDir);
      //unpack
      var AdmZip = require("adm-zip");
      var zip = new AdmZip(fileZipPath);
      // extracts everything
      zip.extractAllTo(/*target path*/ unpackDir, /*overwrite*/ true);
      /*
      const zip = new StreamZip.async({ file: fileZipPath });
      const entriesCount = await zip.entriesCount;
      console.log(`Entries read: ${entriesCount}`);

      const count = await zip.extract(null, unpackDir);
      console.log(`Extracted ${count} entries`);
      await zip.close();
      */
      result = new IotResult(StatusResult.Ok,undefined,undefined);
      result.returnObject=unpackDir;
    } catch (err: any){
      result = new IotResult(StatusResult.Error,`Error while unpacking file ${fileZipPath}`,err);
    }
    //result
    return result;
  }

  public Move(destDir:string):IotResult {
    let result:IotResult;
    try {
      //clear
      if (fs.existsSync(destDir)) fs.emptyDirSync(destDir);
      //mkdir
      IoTHelper.MakeDirSync(destDir);
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
      if(compare(`${version}`,`${this.Attributes.Version}`, '=')) return 0;
      if(compare(`${version}`,`${this.Attributes.Version}`, '>')) return 1;
    }
    return -1;
  }

  public Recovery():IotResult
  {
    let result:IotResult;
    const fileZipPath=`${this.RecoverySourcePath}\\${this.ParentNameDir}.zip`;
    result= this.UnpackFromZip(fileZipPath,path.dirname(this.ParentDir));
    //result
    return result;
  }

  public IsCompatible1(endDeviceArchitecture:string|undefined):boolean
  {
    const result=this.Attributes.EndDeviceArchitecture.find(x=>x==endDeviceArchitecture);
    if(result) return true; else  return false;
  }
}
