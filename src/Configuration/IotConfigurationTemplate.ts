import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { IoTHelper } from '../Helper/IoTHelper';
import { IotResult,StatusResult } from '../IotResult';
import { EntityType } from '../Entity/EntityType';
import { Constants } from "../Constants";
//block
import { IotBuiltInConfig } from './IotBuiltInConfig';
import { IotConfiguration } from './IotConfiguration';
import { IotConfigurationEntity } from './IotConfigurationEntity';
import { IotConfigurationExtension } from './IotConfigurationExtension';
import { IotConfigurationFolder } from './IotConfigurationFolder';
import { IotConfigurationSbc } from './IotConfigurationSbc';
//
import { IConfigurationTemplate } from './IConfigurationTemplate';

export class IotConfigurationTemplate implements IConfigurationTemplate {
  public get TitleLaunch():string {
    return <string>vscode.workspace.getConfiguration().get('fastiot.launch.templatetitle');}
  public get ListSourceUpdateCommunity(): string[] {
    return this.InitListSourceUpdateCommunity();}
  public get LoadOnStart():boolean {
    return <boolean>vscode.workspace.getConfiguration().get('fastiot.template.loadonstart');}
  
  constructor() {}

  private InitListSourceUpdateCommunity(): string[] {
    let listSourceUpdateTemplateCommunity:string[]=[];
    try {
      //Get url line for update community template
      let urlLine: string=<string>vscode.workspace.getConfiguration().get('fastiot.template.community.updatesource');
      if(urlLine != null && urlLine != undefined && urlLine != "")
      {
        listSourceUpdateTemplateCommunity=IoTHelper.StringToArray(urlLine,`;`);
        urlLine=listSourceUpdateTemplateCommunity.join(`;`);
        //Saving settings
        vscode.workspace.getConfiguration().update('fastiot.template.community.updatesource',urlLine,true);
      }
    } catch (err: any){}
    return listSourceUpdateTemplateCommunity;
  }

}
