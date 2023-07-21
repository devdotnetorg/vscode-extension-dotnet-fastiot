import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IoTHelper } from '../Helper/IoTHelper';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IYamlValidator } from './IYamlValidator';
import { YamlRedHatServiceSingleton } from './YamlRedHatServiceSingleton';
import { SSH2Stream } from 'ssh2-streams';

/*
Sample:
  /init Extensin YamlRedHat
	let instanceExtension = YamlRedHatServiceSingleton.getInstance();
	let rez = await instanceExtension.ActivateAsync();
  console.log(rez.toString());
  const yamlFilePath="d:\\template.fastiot.yaml";
  const schemaFilePath="d:\\template.fastiot.schema.redhat.vscode-yaml.yaml";
  rez = await instanceExtension.ValidateSchemaAsync(yamlFilePath,schemaFilePath);
  console.log(rez.toString());
*/

export class YamlValidatorRedHat {  
  private readonly _schemasFolderPath: string;
  
  constructor(schemasFolderPath: string){
      this._schemasFolderPath=schemasFolderPath;
  }

  public async ValidateSchema(yamlFilePath:string, schemaFileName:string):Promise<IotResult>
  {
    let result:IotResult;
    let validationErrors:Array<string>=[];
    try {
      //init
      const instanceExtension = YamlRedHatServiceSingleton.getInstance();
      result= await instanceExtension.ActivateAsync();
      if(result.Status==StatusResult.Error) {
        validationErrors.push(result.toString());
        result.returnObject=validationErrors;
        return Promise.resolve(result);
      }
      //process
      const schemaFilePath=path.join(this._schemasFolderPath, schemaFileName);
      result= await instanceExtension.ValidateSchemaAsync(yamlFilePath,schemaFilePath);
      if(result.Status==StatusResult.Error) {
        validationErrors.push(result.toString());
        result.returnObject=validationErrors;
        return Promise.resolve(result);
      }
      //result
      result.AddMessage(`${yamlFilePath} file has been validated`);
    } catch (err: any){
      //result
      const errorMsg=`Error ValidateSchema. pathFileYml = ${yamlFilePath}, schemaFileName = ${schemaFileName}`;
      result = new IotResult(StatusResult.Error,errorMsg,err);
      validationErrors.push(result.toString());
      result.returnObject=validationErrors;
    }
    return result;
  }
}
  