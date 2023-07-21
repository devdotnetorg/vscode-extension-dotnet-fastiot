import * as vscode from 'vscode';
//import * as fs from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { IotResult,StatusResult } from '../IotResult';
import { IotTemplateCollection } from '../Templates/IotTemplateCollection';
import { IoTHelper } from '../Helper/IoTHelper';
import { IContexUI } from '../ui/IContexUI';
import { compare } from 'compare-versions';
import { basename } from 'path';
//block
import { IBuiltInConfigStorage } from './IBuiltInConfigStorage';
import { IotConfiguration } from './IotConfiguration';
import { IotConfigurationEntity } from './IotConfigurationEntity';
import { IotConfigurationExtension } from './IotConfigurationExtension';
import { IotConfigurationFolder } from './IotConfigurationFolder';
import { IotConfigurationSbc } from './IotConfigurationSbc';
import { IotConfigurationTemplate } from './IotConfigurationTemplate';
//

export class IotBuiltInConfig {
  private readonly _nameKeySetting:string;
  //keys
  public PreviousVerExt: string;
  public LastUpdateTimeEntitiesInHours:number;
  public PreviousHostnameSbcWhenAdding: string;
  
  constructor(nameKeySetting:string)
  {
    this._nameKeySetting=nameKeySetting;
    //read key
    const configJson:any=vscode.workspace.getConfiguration().get(this._nameKeySetting);
    //parse
    if(configJson&&configJson.PreviousVerExt)
      this.PreviousVerExt=configJson.PreviousVerExt;
      else this.PreviousVerExt="0.1";
    //
    if(configJson&&configJson.LastUpdateTimeEntitiesInHours)
      this.LastUpdateTimeEntitiesInHours=configJson.LastUpdateTimeEntitiesInHours;
      else this.LastUpdateTimeEntitiesInHours=0;
    //
    if(configJson&&configJson.PreviousHostnameSbcWhenAdding)
      this.PreviousHostnameSbcWhenAdding=configJson.PreviousHostnameSbcWhenAdding;
      else this.PreviousHostnameSbcWhenAdding="192.168.50.75";
  }

  public async Save()
  {
    //Built-in config
    const data:IBuiltInConfigStorage = {
      PreviousVerExt: this.PreviousVerExt,
      LastUpdateTimeEntitiesInHours: this.LastUpdateTimeEntitiesInHours,
      PreviousHostnameSbcWhenAdding:this.PreviousHostnameSbcWhenAdding
    };
    //write
    vscode.workspace.getConfiguration().update(this._nameKeySetting,data,true);
  }

}
