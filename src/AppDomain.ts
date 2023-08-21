import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IoTApplication } from './IoTApplication';

export class AppDomain {
  private static instance: AppDomain;
  
  private _app:IoTApplication;
  public get CurrentApp():IoTApplication {
    return this._app;}

  private constructor() {
    this._app= new IoTApplication();
  }

  public static getInstance(): AppDomain {
    if (!AppDomain.instance) AppDomain.instance = new AppDomain();
    return AppDomain.instance;
  }

  public AddInstanceApp = (app:IoTApplication) => this._app=app;
  
}
