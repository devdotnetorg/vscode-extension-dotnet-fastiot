import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { IoTHelper } from '../Helper/IoTHelper';
import { IotResult,StatusResult } from '../IotResult';
import { EntityType } from '../Entity/EntityType';
import { Constants } from "../Constants"
//
import { IConfigurationEntity } from '../Configuration/IConfigurationEntity';

export class IotConfigurationEntityFake implements IConfigurationEntity {
  public get IsUpdate():boolean { //Template update
    return false;}
  public get UpdateIntervalHours():number { //Template update
    return 0;}
  public get DebugMode():boolean {
    return false;}
  public get LastUpdateHours(): number {
    return 0;}
  public set LastUpdateHours(value:number) {}

  constructor() {}

}
