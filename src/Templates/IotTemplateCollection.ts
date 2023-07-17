import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import { IotResult,StatusResult } from '../IotResult';
import { EntityType } from '../Entity/EntityType';
import { EntityCollection, IConfigEntityCollection } from '../Entity/EntityCollection';
import { IotTemplate } from './IotTemplate';
import { IotTemplateAttribute } from './IotTemplateAttribute';

export class IotTemplateCollection extends EntityCollection<IotTemplateAttribute,IotTemplate> {

  constructor(
    config:IConfigEntityCollection,
    getDirEntitiesCallback:(type:EntityType) => string,
    saveLastUpdateHours:(value:number) => void
    ){
      super("template","templates",IotTemplate,config,getDirEntitiesCallback,saveLastUpdateHours);
  }

  public async ImportTemplateUserFromZip(fileZipPath:string):Promise<IotResult>
  {
    return super.ImportEntityFromZip(fileZipPath,EntityType.user);
  }

}
