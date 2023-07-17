import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { IoTHelper } from '../Helper/IoTHelper';
import { IotResult,StatusResult } from '../IotResult';
import { EntityType } from '../Entity/EntityType';
import { Constants } from "../Constants";
import { IConfigurationSbc } from "./IConfigurationSbc";
import { IConfigurationFolder } from './IConfigurationFolder';
//block
import { IotBuiltInConfig } from './IotBuiltInConfig';
import { IotConfiguration } from './IotConfiguration';
import { IotConfigurationEntity } from './IotConfigurationEntity';
import { IotConfigurationExtension } from './IotConfigurationExtension';
import { IotConfigurationFolder } from './IotConfigurationFolder';
import { IotConfigurationTemplate } from './IotConfigurationTemplate';
//

export class IotConfigurationSbc implements IConfigurationSbc{
  private _builtInConfig: IotBuiltInConfig;
  private _configurationFolder: IConfigurationFolder;
  //
  public get UsernameDebugAccount():string {
    return <string>vscode.workspace.getConfiguration().get('fastiot.sbc.account.debug.username');}
  public get GroupsDebugAccount():string[] {
    const value = 
      IoTHelper.StringToArray(<string>vscode.workspace.getConfiguration().get('fastiot.sbc.account.debug.groups'),',');
    return value;}
  public get UsernameManagementAccount():string {
    return <string>vscode.workspace.getConfiguration().get('fastiot.sbc.account.management.username');}
  public get GroupsManagementAccount():string[] {
    const value = 
      IoTHelper.StringToArray(<string>vscode.workspace.getConfiguration().get('fastiot.sbc.account.management.groups'),',');
    return value;}
  public get TypeKeySsh():string {
    const KeySsh = this.InitTypeAndBitsKeySshSbc();
    return KeySsh.TypeKey;}
  public get BitsKeySsh():number {
    const KeySsh = this.InitTypeAndBitsKeySshSbc();
    return KeySsh.BitsKey;}
  public get DebugAppFolder():string {
    return <string>vscode.workspace.getConfiguration().get('fastiot.sbc.debug.app.folder');}
  public get FileNameUdevRules():string {
    return <string>vscode.workspace.getConfiguration().get('fastiot.sbc.udevfilename');}
  public get ListUdevRulesFiles():string[] {
    return this.GetListUdevRulesFiles();}
  public get PreviousHostname(): string {
    return this._builtInConfig.PreviousHostnameSbc ;}
  public set PreviousHostname(value:string) {
    this._builtInConfig.PreviousHostnameSbc=value;
    this._builtInConfig.Save();}
  //SBCs storage
  public get ProfilesSBCJson():any {
    return <string>vscode.workspace.getConfiguration().get('fastiot.sbc.profiles.JSON');}
  public set ProfilesSBCJson(data:any) {
      vscode.workspace.getConfiguration().update('fastiot.sbc.profiles.JSON',data,true);}

  constructor(builtInConfig: IotBuiltInConfig, configurationFolder: IConfigurationFolder) {
    this._builtInConfig=builtInConfig;
    this._configurationFolder=configurationFolder;
  }

  private InitTypeAndBitsKeySshSbc(): {TypeKey: string,BitsKey: number} {
    //check type and bits of key
    let typeKeySshSbc=<string>vscode.workspace.getConfiguration().get('fastiot.sbc.ssh.key.customtype');
    let bitsKeySshSbc=<number>vscode.workspace.getConfiguration().get('fastiot.sbc.ssh.key.custombits');
    if(typeKeySshSbc == null||typeKeySshSbc == undefined||typeKeySshSbc == "")
      {
        const sshKeytype=<string>vscode.workspace.getConfiguration().get('fastiot.sbc.ssh.keytype');
        const sshKeytypeArray=IoTHelper.StringToArray(sshKeytype,'-');
        typeKeySshSbc=sshKeytypeArray[0];
        bitsKeySshSbc=+sshKeytypeArray[1];
      }
    const result: {TypeKey: string,BitsKey: number} = {
      TypeKey: typeKeySshSbc,
      BitsKey:bitsKeySshSbc
    }
    return result;
  }
  
  private GetListUdevRulesFiles(): string[] {
    let items:string[]=[];
    let filePath:string;
    //reading files from the \linux\config\udevrules\ directory
    filePath = 
      path.join(this._configurationFolder.Extension.fsPath,
        "linux", "config","udevrules");
    items=items.concat(IoTHelper.GetAllFile(filePath));
    //reading files from the %userprofile%\settings\udevrules\ directory
    filePath = this._configurationFolder.UdevRules;
    items=items.concat(IoTHelper.GetAllFile(filePath));
    //get filename
    let result:string[]=[];
    items.forEach((item) => {
      result.push(path.basename(item));
    });
    //remove duplicates
    result=IoTHelper.uniqByForEach<string>(result);
    //result
    return result;
  }

  public GetUdevRulesFile(fileName:string): IotResult {
    let result:IotResult;
    let pathFileLocalRules:string| undefined;
    let pathFileLocalRules_temp:string;
    let dataFile:string;
    //reading file from the \linux\config\udevrules\ directory
    pathFileLocalRules_temp = 
      path.join(this._configurationFolder.Extension.fsPath,
        "linux", "config","udevrules",fileName);
    if (fs.existsSync(pathFileLocalRules_temp)) {
      pathFileLocalRules=pathFileLocalRules_temp;
    }else {
      //reading file from the %userprofile%\settings\udevrules\ directory
      pathFileLocalRules_temp = 
        path.join(this._configurationFolder.UdevRules,fileName);
          if (fs.existsSync(pathFileLocalRules_temp))
            pathFileLocalRules=pathFileLocalRules_temp;
    }
    //read file
    if(pathFileLocalRules) {
      //Ok
      dataFile= fs.readFileSync(pathFileLocalRules, 'utf8');
      result = new IotResult(StatusResult.Ok);
      result.returnObject=dataFile;
    }else {
      //File not found
      result = new IotResult(StatusResult.Error,`File not found! ${pathFileLocalRules_temp}`);
    }
    //result
    return result;
  }

}
