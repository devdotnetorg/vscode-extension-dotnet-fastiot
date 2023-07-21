import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { EntityEnum } from '../Entity/EntityEnum';
import { EntityCollection } from '../Entity/EntityCollection';
import { IConfigEntityCollection } from '../Entity/IConfigEntityCollection';
import { IotTemplate } from './IotTemplate';
import { IotTemplateAttribute } from './IotTemplateAttribute';

export class IotTemplateCollection extends EntityCollection<IotTemplateAttribute,IotTemplate> {

  constructor(
    config:IConfigEntityCollection
    ){
      super("template","templates",IotTemplate,config);
  }

  public async ImportTemplateUserFromZip(fileZipPath:string):Promise<IotResult>
  {
    return super.ImportEntityFromZip(fileZipPath,EntityEnum.user);
  }

}
