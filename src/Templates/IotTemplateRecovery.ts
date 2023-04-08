import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { EntityType } from '../Entity/EntityType';
import { EntityRecovery } from '../Entity/EntityRecovery';

export class IotTemplateRecovery extends EntityRecovery {

  constructor(type:EntityType
    ){
      super();
  }
}
