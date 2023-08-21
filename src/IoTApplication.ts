import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IotResult,StatusResult } from './Shared/IotResult';
import { IContexUI } from './ui/IContexUI';
import { IotTemplateCollection } from './Templates/IotTemplateCollection';
import { IConfiguration } from './Configuration/IConfiguration';
import { IoT } from './Types/Enums';
import EntityEnum = IoT.Enums.Entity;
import { IConfigEntityCollection } from './Entity/IConfigEntityCollection';
import { IotBuiltInConfig } from './Configuration/IotBuiltInConfig';
import { IoTSbcCollection } from './Sbc/IoTSbcCollection';
import { ISbc } from './Sbc/ISbc';
import { IoTSbc } from './Sbc/IoTSbc';
import { IConfigSbcCollection } from './Sbc/IConfigSbcCollection';

//Fake
import { UIFake } from './Fake/UIFake';
import { IotConfigurationFake } from './Fake/IotConfigurationFake';

export class IoTApplication {

  public UI:IContexUI;
  public Config:IConfiguration;
  public Templates: IotTemplateCollection;
  public SBCs:IoTSbcCollection<ISbc>;
  
  constructor(){
    //Fake
    this.UI= new UIFake();
    this.Config=new IotConfigurationFake ();
    //Templates
    const getDirTemplatesCallback = (type:EntityEnum):string => {
      return "";
    };
    const saveLastUpdateHours = (value:number):void=> {};

    const configTemplateCollection:IConfigEntityCollection = {
      extVersion: "",
      extMode: vscode.ExtensionMode.Test,
      recoverySourcePath: "",
      schemasFolderPath: "",
      tempFolderPath:"",
      lastUpdateTimeInHours:0,
      isUpdate:false,
      updateIntervalInHours:0,
      urlsUpdateEntitiesCommunity:[""],
      urlUpdateEntitiesSystem:"",
      getDirEntitiesCallback:getDirTemplatesCallback,
      saveLastUpdateHours:saveLastUpdateHours
    };
    
    this.Templates= new IotTemplateCollection(configTemplateCollection);

    const getProfilesSBC = ():string => {
      return "";
    };

    const setProfilesSBC = (value:string):void=> {};

    const configSbcCollection :IConfigSbcCollection = {
      getProfilesSBCJson: getProfilesSBC,
      setProfilesSBCJson: setProfilesSBC
    };

    this.SBCs = new IoTSbcCollection<ISbc>(IoTSbc,configSbcCollection);
  }
}
