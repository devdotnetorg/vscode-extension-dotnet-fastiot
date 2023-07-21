import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

import { IConfigurationEntity } from '../Configuration/IConfigurationEntity';

export class IotConfigurationEntityFake implements IConfigurationEntity {
  public IsUpdate:boolean=false;
  public UpdateIntervalInHours:number=0;
  public DebugMode:boolean=false;
  public LastUpdateTimeInHours: number=0;
  constructor() {}

}
