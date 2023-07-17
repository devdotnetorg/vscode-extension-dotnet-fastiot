import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { IoTHelper } from '../Helper/IoTHelper';
import { IotResult,StatusResult } from '../IotResult';
import { EntityType } from '../Entity/EntityType';
import { Constants } from "../Constants";
import { IConfigurationSbc } from "../Configuration/IConfigurationSbc";

export class IotConfigurationSbcFake implements IConfigurationSbc{
  public get UsernameDebugAccount():string {
    return "";}
  public get GroupsDebugAccount():string[] {
    const value = 
      IoTHelper.StringToArray("none1,none2",',');
    return value;}
  public get UsernameManagementAccount():string {
    return "";}
  public get GroupsManagementAccount():string[] {
    const value = 
      IoTHelper.StringToArray("none1,none2",',');
    return value;}
  public get TypeKeySsh():string {
    return "";}
  public get BitsKeySsh():number {
    return 0;}
  public get DebugAppFolder():string {
    return "";}
  public get FileNameUdevRules():string {
    return "";}
  public get PreviousHostname(): string {
    return "";}
  public set PreviousHostname(value:string) {}
  //SBCs storage
  public get ProfilesSBCJson():any {
    return undefined;}
  public set ProfilesSBCJson(data:any) {}

  constructor() {}

}
