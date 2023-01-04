import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {EntityType} from '../Entity/EntityType';
import {EntityBase} from '../Entity/EntityBase';
import {EntityBaseAttribute} from '../Entity/EntityBaseAttribute';

export class IotTemplate extends EntityBase {

  constructor(type:EntityType
    ){
      super(type);
     
  }

  public Parse(path:string){
    this.Attributes
  }
    
   

}


