import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {EntityType} from '../Entity/EntityType';
import {EntityBase} from '../Entity/EntityBase';
import {EntityBaseAttribute} from '../Entity/EntityBaseAttribute';
import {EntityDownloader} from '../Entity/EntityDownloader';
import {IotTemplateCollection } from './IotTemplateCollection';

export class IotTemplateDownloader extends EntityDownloader {

  constructor(
    ){
      super();
  }

  protected async UpdateSystemTemplate(url:string,destPath:string,tempPath:string,collection:IotTemplateCollection):Promise<IotResult>
  {

  }


}


