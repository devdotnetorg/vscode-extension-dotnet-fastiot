import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { IoTHelper } from '../Helper/IoTHelper';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IoT } from '../Types/Enums';
import EntityEnum = IoT.Enums.Entity;
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
  public get DebugUserNameAccount():string {
    return <string>vscode.workspace.getConfiguration().get('fastiot.sbc.account.debug.username');}
  public get DebugGroupsAccount():string[] {
    const value = 
      IoTHelper.StringToArray(<string>vscode.workspace.getConfiguration().get('fastiot.sbc.account.debug.groups'),',');
    return value;}
  public get ManagementUserNameAccount():string {
    return <string>vscode.workspace.getConfiguration().get('fastiot.sbc.account.management.username');}
  public get ManagementGroupsAccount():string[] {
    const value = 
      IoTHelper.StringToArray(<string>vscode.workspace.getConfiguration().get('fastiot.sbc.account.management.groups'),',');
    return value;}
  public get SshKeyType():string {
    const KeySsh = this.InitTypeAndBitsKeySshSbc();
    return KeySsh.TypeKey;}
  public get SshKeyBits():number {
    const KeySsh = this.InitTypeAndBitsKeySshSbc();
    return KeySsh.BitsKey;}
  public get DebugAppFolder():string {
    return <string>vscode.workspace.getConfiguration().get('fastiot.sbc.debug.app.folder');}
  public get FileNameUdevRules():string {
    let value = <string>vscode.workspace.getConfiguration().get('fastiot.sbc.udevfilename');
    const result = this.GetFileUdevRules(value,true);
    if(result.Status!=StatusResult.Ok) {
      value = Constants.fileNameUdevRules;
      vscode.workspace.getConfiguration().update('fastiot.sbc.udevfilename',value,true);
    }
    return value;
  }
  public get ListFilesUdevRules():string[] {
    return this.GetListFilesUdevRules();}
  public get PreviousHostWhenAdding(): string {
    return this._builtInConfig.PreviousHostSbcWhenAdding ;}
  public set PreviousHostWhenAdding(value:string) {
    this._builtInConfig.PreviousHostSbcWhenAdding=value;
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
  
  private GetListFilesUdevRules(): string[] {
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

  public GetFileUdevRules(fileName:string, isTest?:boolean): IotResult {
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
      result = new IotResult(StatusResult.Ok);

      if(!isTest) {
        dataFile= fs.readFileSync(pathFileLocalRules, 'utf8');
        result.returnObject=dataFile;
      }
    }else {
      //File not found
      result = new IotResult(StatusResult.Error,`File not found! ${pathFileLocalRules_temp}`);
    }
    //result
    return result;
  }

}
