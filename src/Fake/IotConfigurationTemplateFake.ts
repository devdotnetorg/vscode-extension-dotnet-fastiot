import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { IoTHelper } from '../Helper/IoTHelper';
import { IotResult,StatusResult } from '../IotResult';
import { EntityType } from '../Entity/EntityType';
import { Constants } from "../Constants";
import { IConfigurationTemplate } from '../Configuration/IConfigurationTemplate';

export class IotConfigurationTemplateFake implements IConfigurationTemplate {
  public get TitleLaunch():string {
    return "";}
  public get ListSourceUpdateCommunity(): string[] {
    const value = 
      IoTHelper.StringToArray("none1,none2",',');
    return value;}
  public get LoadOnStart():boolean {
    return false;}
  
  constructor() {}

}
