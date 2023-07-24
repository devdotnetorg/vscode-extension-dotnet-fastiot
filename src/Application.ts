import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IContexUI } from './ui/IContexUI';
import { IotTemplateCollection } from './Templates/IotTemplateCollection';
import { IoTApplication } from './IoTApplication';
import { IConfiguration } from './Configuration/IConfiguration';
import { AppDomain } from './AppDomain';
import { IoTHelper } from './Helper/IoTHelper';
import { IotConfiguration } from './Configuration/IotConfiguration';
import { IotResult,StatusResult } from './Shared/IotResult';
import { IConfigEntityCollection } from './Entity/IConfigEntityCollection';
import { Constants } from "./Constants";
import { UI } from './ui/UI';
import { IoT } from './Types/Enums';
import EntityEnum = IoT.Enums.Entity;

export class ApplicationBuilder {
  private _instance: IoTApplication;
  
  constructor(){
    this._instance= new IoTApplication();
  }

  public BuildUI = (value:IContexUI) => this._instance.UI=value;
  public BuildConfig = (value:IConfiguration) => this._instance.Config=value;
  public BuildTemplates = (value:IotTemplateCollection) => this._instance.Templates=value;
  /**
   * Get instance IoTApplication
   */
  public getInstance ():IoTApplication {
    return this._instance;
  }

}

export function BuildApplication(context: vscode.ExtensionContext):IoTApplication
{
	//Config
	let config=new IotConfiguration(context);
	//UI
	let contextUI= new UI(config.Extension.Loglevel);
	//Templates
	//Templates config
	let urlUpdateTemplatesSystem:string="";
	if(config.Extension.Mode==vscode.ExtensionMode.Production) {
		urlUpdateTemplatesSystem=Constants.urlUpdateTemplatesSystemRelease;
    }else {
		//for test
      	urlUpdateTemplatesSystem=Constants.urlUpdateTemplatesSystemDebug;
    }

	const getDirTemplatesCallback = (type:EntityEnum):string => {
		return config.Folder.GetDirTemplates(type);
	};

	const saveLastUpdateHours = (value:number):void=> {
		config.Template.LastUpdateTimeInHours=value;
	};
	
    const configTemplateCollection:IConfigEntityCollection = {
		extVersion: config.Extension.Version,
		extMode: config.Extension.Mode,
		recoverySourcePath: path.join(config.Folder.Extension.fsPath, "templates", "system"),
		schemasFolderPath: config.Folder.Schemas,
		tempFolderPath:config.Folder.Temp,
		lastUpdateTimeInHours:config.Template.LastUpdateTimeInHours,
		isUpdate:config.Entity.IsUpdate,
		updateIntervalInHours:config.Entity.UpdateIntervalInHours,
		urlsUpdateEntitiesCommunity:config.Template.ListSourceUpdateCommunity,
		urlUpdateEntitiesSystem:urlUpdateTemplatesSystem,
		getDirEntitiesCallback:getDirTemplatesCallback,
		saveLastUpdateHours:saveLastUpdateHours
	};


	let templates= new IotTemplateCollection(configTemplateCollection);
	//Build
	let applicationBuilder = new ApplicationBuilder();
	applicationBuilder.BuildUI(contextUI);
	applicationBuilder.BuildConfig(config);
	applicationBuilder.BuildTemplates(templates);
	let app = applicationBuilder.getInstance();
	//Init AppDomain
	const appDomain = AppDomain.getInstance();
	appDomain.AddInstanceApp(app);
	//Test
	//
	//result
	return app;
}
