import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import { IotResult,StatusResult } from '../IotResult';
import { EntityType } from '../Entity/EntityType';
import { EntityCollection, IConfigEntityCollection } from '../Entity/EntityCollection';
import { IotTemplate } from './IotTemplate';
import { IotTemplateAttribute } from './IotTemplateAttribute';

export class IotTemplateCollection extends EntityCollection<IotTemplateAttribute,IotTemplate> {

  constructor(getDirEntitiesCallback:(type:EntityType) =>string,config:IConfigEntityCollection){
      super("template","templates",IotTemplate,getDirEntitiesCallback,config);
  }

  public async ImportTemplateUserFromZip(fileZipPath:string):Promise<IotResult>
  {
    return super.ImportEntityFromZip(fileZipPath,EntityType.user);
  }

}
