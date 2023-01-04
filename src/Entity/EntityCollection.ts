import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {EntityBase} from './EntityBase';

export abstract class EntityCollection extends Map<string,EntityBase> {
  constructor(
    ){
      super(); 
    }
}


