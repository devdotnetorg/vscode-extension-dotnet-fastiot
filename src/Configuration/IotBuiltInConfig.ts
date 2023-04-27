import * as vscode from 'vscode';
//import * as fs from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { IotResult,StatusResult } from '../IotResult';
import { IotConfigurationFolder } from './IotConfigurationFolder';
import { IBuiltInConfig } from './IBuiltInConfig';
import { IotTemplateCollection } from '../Templates/IotTemplateCollection';
import { IoTHelper } from '../Helper/IoTHelper';
import { IContexUI } from '../ui/IContexUI';
import { compare } from 'compare-versions';
import { basename } from 'path';

export class IotBuiltInConfig implements IBuiltInConfig {

  private readonly _nameKeySetting:string='fastiot.config.JSON';

  public PreviousVerExt: string;
  public LastUpdateTemplatesHours:number;
  
  constructor()
  {
    //read key
    const configJson:any=vscode.workspace.getConfiguration().get(this._nameKeySetting);
    //parse
    if(configJson.PreviousVerExt)
      this.PreviousVerExt=configJson.PreviousVerExt;
      else this.PreviousVerExt="0.1";
    //
    if(configJson.LastUpdateTemplatesHours)
      this.LastUpdateTemplatesHours=configJson.LastUpdateTemplatesHours;
      else this.LastUpdateTemplatesHours=0;
    //
  }

  public async Save()
  {
    //Built-in config
    const data:IBuiltInConfig = {
      PreviousVerExt: this.PreviousVerExt,
      LastUpdateTemplatesHours: this.LastUpdateTemplatesHours
    };
    //write
    vscode.workspace.getConfiguration().update(this._nameKeySetting,data,true);
  }

}
