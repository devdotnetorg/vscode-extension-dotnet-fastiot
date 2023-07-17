import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { LogLevel } from '../shared/LogLevel';
import { IoTHelper } from '../Helper/IoTHelper';
import { IotResult,StatusResult } from '../IotResult';
import { EntityType } from '../Entity/EntityType';
import { Constants } from "../Constants"
import { IConfigurationExtension } from '../Configuration/IConfigurationExtension';

export class IotConfigurationExtensionFake implements IConfigurationExtension{
  public get Version(): string {
    return "";}
  public get PreviousVersion(): string {
    return "";}
  public set PreviousVersion(value:string) {}
  public get Mode(): vscode.ExtensionMode {
    return vscode.ExtensionMode.Test;}
  public get Loglevel():LogLevel {
    return LogLevel.Debug;}
  
  constructor() {}

}
