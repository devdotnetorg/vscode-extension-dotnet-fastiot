import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { StatusResult,IotResult } from './IotResult';
import { IContexUI } from './ui/IContexUI';
import { IotTemplateCollection } from './Templates/IotTemplateCollection';
import { IoTApplication } from './IoTApplication';
import { IConfiguration } from './Configuration/IConfiguration';

export class IoTApplicationBuilder {

  private _instance: IoTApplication;
  
  constructor(){
    this._instance= new IoTApplication();
  }

  public BuildUI (value:IContexUI) {
    this._instance.UI=value;
  }

  public BuildConfig (value:IConfiguration) {
    this._instance.Config=value;
  }

  public BuildTemplates (value:IotTemplateCollection) {
    this._instance.Templates=value;
  }

  /**
   * Get instance IoTApplication
   */
  public getInstance ():IoTApplication {
    return this._instance;
  }

}
