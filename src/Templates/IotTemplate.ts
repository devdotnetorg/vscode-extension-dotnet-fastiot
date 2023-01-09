import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {EntityType} from '../Entity/EntityType';
import {EntityBase} from '../Entity/EntityBase';
import {EntityBaseAttribute} from '../Entity/EntityBaseAttribute';
import {IotTemplateAttribute} from './IotTemplateAttribute';

export class IotTemplate extends EntityBase<IotTemplateAttribute> {
  public get AppsPath(): string {
    return this.ParentDir+"\\apps";}
  public get TemplatePath(): string {
    return this.ParentDir+"\\template";}
  public get ImagePath(): string {
    return this.ParentDir+"\\template.fastiot.png";}

  constructor(
    ){
      super("Template",new IotTemplateAttribute());
  }

  public Init(type:EntityType,filePath:string,recoverySourcePath:string|undefined)
  {
    super.Init(type,filePath,recoverySourcePath);
    if(!this.IsValid) return;
    //next
    this.Validation();
    //if(this.IsValid) this.Parse(filePath);
  }

  protected Validation(){
    this._validationErrors=[];
    //проверка структуры папок
    if (!fs.existsSync(this.AppsPath)) 
      this._validationErrors.push(`${this.AppsPath} folder does not exist`);
    if (!fs.existsSync(this.TemplatePath)) 
      this._validationErrors.push(`${this.TemplatePath} folder does not exist`);
    if (!fs.existsSync(this.ImagePath)) 
      this._validationErrors.push(`${this.ImagePath} file does not exist`);
  }

}
