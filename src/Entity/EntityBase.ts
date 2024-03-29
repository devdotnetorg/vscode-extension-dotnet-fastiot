import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import { compare } from 'compare-versions';
import { EntityType } from './EntityType';
import { EntityBaseAttribute } from './EntityBaseAttribute';
import { IoTHelper } from '../Helper/IoTHelper';
import { IotResult,StatusResult } from '../IotResult';

export abstract class EntityBase<T extends EntityBaseAttribute> {
  protected readonly _entityLabel:string; //for understandable log
  protected readonly _entitiesLabel:string; //for understandable log
  private _yamlFilePath:string=""; //YAML file
  public get YAMLFilePath(): string {
    return this._yamlFilePath;}
  public get RootDir(): string {
    return path.dirname(this.YAMLFilePath);}
  public get RootNameDir(): string|undefined {
    return path.dirname(this.YAMLFilePath).split(path.sep).pop();}
  private _recoverySourcePath?:string;
  public get RecoverySourcePath(): string|undefined {
      return this._recoverySourcePath;}
  //Validation
  public get IsValid(): boolean {
    if(this._validationErrors.length==0) return true;else return false;}
  protected _validationErrors:Array<string>=[]; 
  public get ValidationErrors(): Array<string> {
      return this._validationErrors;}

  public get ValidationErrorsToString(): string {
    let msg=`Validation messages:`;
    let index=1;
    this._validationErrors.forEach((item) => {
      msg=`${msg}\n${index}. ${item}`;
      index++;
    });
    return msg;}
  public Attributes: T;
  public Type:EntityType=EntityType.none;

  protected _pathFolderSchemas: string;

  constructor( entityLabel:string, entitiesLabel:string,
    TCreator: new(pathFolderSchemas?: string) => T,
    pathFolderSchemas: string
    ){
      this._entityLabel=entityLabel;
      this._entitiesLabel=entitiesLabel;
      this.Attributes=new TCreator(pathFolderSchemas);
      //
      this._pathFolderSchemas=pathFolderSchemas;
      this._validationErrors.push("non");
  }

  public Init(type:EntityType,yamlFilePath:string,recoverySourcePath?:string)
  {
    try {
      this.Type= type;
      this._recoverySourcePath=recoverySourcePath;
      this._yamlFilePath=yamlFilePath;
      this.ValidateEntityBase();
      if(!this.IsValid) return;
      //if(this.IsValid) this.Parse(path);
      let attributes = this.Attributes as any; 
      attributes.Init(this.YAMLFilePath);
      if(attributes.IsValid) {
        //ok
        //check if folder matches entity and id
        if(this.RootNameDir!=attributes.Id)
          this._validationErrors.push(`${this._entityLabel} folder name ${this.RootNameDir} `+
            `does not match id value ${attributes.Id}.`+
            `You need to rename the folder or change the ${this._entityLabel} id.`);
      }else{
        //error
        this._validationErrors = attributes.ValidationErrors.slice();
      }
    } catch (err: any){
      this._validationErrors.push(`Error Init ${this._entitiesLabel}. Error: ${err}`);
    }
  }
  
  private ValidateEntityBase(){
    this._validationErrors=[];
    if (!fs.existsSync(this.YAMLFilePath)) 
      this._validationErrors.push(`${this.YAMLFilePath} file does not exist`);
  }

  public Move(destDir:string):IotResult {
    let result:IotResult;
    try {
      //delete
      if (fs.existsSync(destDir)) {
        fs.emptyDirSync(destDir);
        fs.removeSync(destDir);
      } 
      //destDir - no need to create a folder 
      fs.moveSync(this.RootDir,destDir);
      //replace fields
      const fileName=this.YAMLFilePath.substring(this.RootDir.length+1);
      this._yamlFilePath= path.join(destDir, fileName);
      result = new IotResult(StatusResult.Ok,`${this._entityLabel}. ${this.RootDir} folder successfully moved to ${destDir} folder`);
    } catch (err: any){
      result = new IotResult(StatusResult.Error,`Unable to move ${this._entityLabel} from folder ${this.RootDir} to folder ${destDir}`,err);
    }
    //result
    return result;
  }

  public Remove ():IotResult {
    let result:IotResult;
    try {
      //delete
      if (fs.existsSync(this.RootDir)) {
        fs.emptyDirSync(this.RootDir);
        fs.removeSync(this.RootDir);
      } 
      result = new IotResult(StatusResult.Ok,`Folder has been deleted: ${this.RootDir}`);
    } catch (err: any){
      result = new IotResult(StatusResult.Error,`Unable to delete ${this._entityLabel} folder: ${this.RootDir}`,err);
    }
    //result
    return result;
  }

  public CompareByVersion(entityBase:EntityBase<T>):number{
    //0 - equal, 1 - entityBase up, -1 - entityBase down
    return this.CompareByVersion2(entityBase.Type,entityBase.Attributes.Version);
  }

  public CompareByVersion2(type:EntityType, version:string):number{
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
    const fileZipPath=`${this.RecoverySourcePath}\\${this.RootNameDir}.zip`;
    result= IoTHelper.UnpackFromZip(fileZipPath,path.dirname(this.RootDir));
    if(result.Status==StatusResult.Error) result.AddMessage(`${this._entityLabel} restore error`);
    //result
    return result;
  }

  public IsCompatibleByEndDeviceArchitecture(endDeviceArchitecture:string):boolean
  {
    const result=this.Attributes.EndDeviceArchitecture.find(x=>x==endDeviceArchitecture);
    if(result) return true; else  return false;
  }
}
