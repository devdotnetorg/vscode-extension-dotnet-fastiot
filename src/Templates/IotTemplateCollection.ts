import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {EntityType} from '../Entity/EntityType';
import {EntityBase} from '../Entity/EntityBase';
import {EntityCollection} from '../Entity/EntityCollection';

import {EntityBaseAttribute} from '../Entity/EntityBaseAttribute';

export class IotTemplateCollection extends EntityCollection {

  constructor(type:EntityType
    ){
      super(type);
     
  }

  public Parse(path:string){
    this.Attributes
  }
    
   

}


