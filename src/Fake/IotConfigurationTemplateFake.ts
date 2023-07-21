import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { IConfigurationTemplate } from '../Configuration/IConfigurationTemplate';

export class IotConfigurationTemplateFake implements IConfigurationTemplate {
  public TitleLaunch:string ="";
  public ListSourceUpdateCommunity: string[] = [];
  public LoadOnStart:boolean = false;
  public LastUpdateTimeInHours=0;
  
  constructor() {}

}
