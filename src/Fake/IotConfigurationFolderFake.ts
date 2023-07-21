import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import * as platformFolders from 'platform-folders';
import { IoTHelper } from '../Helper/IoTHelper';
import { EntityEnum } from '../Entity/EntityEnum';
import { IConfigurationFolder } from '../Configuration/IConfigurationFolder';

export class IotConfigurationFolderFake implements IConfigurationFolder{
  public get ApplicationData(): string {
    return "";}
  public get KeysSbc(): string {
    return "";}
  public get UdevRules(): string {
    return "";}
  public get Extension(): vscode.Uri {
      return vscode.Uri.file("c:\\test");}
  public get AppsBuiltIn(): string {
    return "";}
  public get Temp(): string {
    return "";}
  public get Schemas(): string {
    return "";}
  public get WorkspaceVSCode(): string| undefined {
    return undefined;}
  public get SaveProjectByDefault(): string {  
    return "";}

  constructor() {}

  public GetDirTemplates(type:EntityEnum):string {
    let result:string;
    result="";
    return result;
  }
  
  //clearing temporary files
  public ClearTmp() {}

}
