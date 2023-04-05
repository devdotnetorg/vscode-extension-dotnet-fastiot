import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { StatusResult,IotResult } from './IotResult';
import { IContexUI } from './ui/IContexUI';
import { IotTemplateCollection } from './Templates/IotTemplateCollection';
import {IotConfiguration} from './Configuration/IotConfiguration';

export class IoTApplication {

  public UI:IContexUI;
  public Config:IotConfiguration;
  public Templates: IotTemplateCollection;
  
  constructor(
    contextUI:IContexUI,
    config:IotConfiguration,
    templates: IotTemplateCollection
  ){
    this.UI=contextUI;
    this.Config=config;
    this.Templates=templates;
  }
}
