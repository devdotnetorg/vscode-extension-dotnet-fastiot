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
  public get DebugUserNameAccount():string {
    return "";}
  public get DebugGroupsAccount():string[] {
    const value = 
      IoTHelper.StringToArray("none1,none2",',');
    return value;}
  public get ManagementUserNameAccount():string {
    return "";}
  public get ManagementGroupsAccount():string[] {
    const value = 
      IoTHelper.StringToArray("none1,none2",',');
    return value;}
  public get SshKeyType():string {
    return "";}
  public get SshKeyBits():number {
    return 0;}
  public get DebugAppFolder():string {
    return "";}
  public get FileNameUdevRules():string {
    return "";}
  public get ListFilesUdevRules():string[] {
    return [];}
  public PreviousHostnameWhenAdding: string ="";
  //SBCs storage
  public get ProfilesSBCJson():any {
    return undefined;}
  public set ProfilesSBCJson(data:any) {}

  constructor() {}

  public GetFileUdevRules(fileName:string, isTest?:boolean): IotResult {
    return new IotResult(StatusResult.Ok);
  }

}
