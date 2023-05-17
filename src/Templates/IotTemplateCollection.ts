import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import { EntityType } from '../Entity/EntityType';
import { EntityCollection,ContainsType,IConfigEntityCollection } from '../Entity/EntityCollection';
import { IotTemplate } from './IotTemplate';
import { IotTemplateAttribute } from './IotTemplateAttribute';

export class IotTemplateCollection extends EntityCollection<IotTemplateAttribute,IotTemplate> {

  constructor(getDirEntitiesCallback:(type:EntityType) =>string,config:IConfigEntityCollection){
      super("template",IotTemplate,getDirEntitiesCallback,config);
  }

}
