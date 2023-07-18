import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import YAML from 'yaml';
import { IotResult,StatusResult } from '../IotResult';
import { IYamlValidator } from './IYamlValidator';

export class YamlValidatorFork implements IYamlValidator { 
  private readonly _schemasFolderPath: string;
  
  constructor(schemasFolderPath: string){
      this._schemasFolderPath=schemasFolderPath;
  }
  public ValidateObjBySchema (yamlObj:any, schemaFileName:string):IotResult
  {
    let result:IotResult;
    let validationErrors:Array<string>=[];
    let msg="";
    try {
      //source - https://www.npmjs.com/package/yaml-schema-validator-fork
      const validateSchema = require('yaml-schema-validator-fork');
      // validate a yml file
      const schemaPath=path.join(this._schemasFolderPath, schemaFileName);
      var schemaErrors = validateSchema(yamlObj,
        {
          schemaPath: schemaPath,
          logLevel: 'verbose'
        }
      );
      //convert
      //schemaErrors = [{path: 'person.id', message: 'person.id must be a String'}]
      if(schemaErrors) {
        schemaErrors.forEach((element:any) => {
          const path=element.path;
          const message=element.message;
          msg=`path: ${path}, message: ${message}`;
          validationErrors.push(msg);
        });
      } 
      result = new IotResult(StatusResult.Ok,"Validation was successful");
    } catch (err: any){
      //result
      result = new IotResult(StatusResult.Error,`Object validation error Obj = ${yamlObj}, schemaFileName = ${schemaFileName}`,err);
      validationErrors.push(result.toString());
    }
    result.returnObject=validationErrors;
    return result;
  }

  public ValidateFileBySchema (yamlFilePath:string, schemaFileName:string):IotResult
  {
    let result:IotResult;
    const errMsg="Validation error";
    const schemaPath=path.join(this._schemasFolderPath, schemaFileName);
    //exist
    if (!fs.existsSync(yamlFilePath)) {
      result = new IotResult(StatusResult.Error,`${errMsg}. ${yamlFilePath} file does not exist`);
      return result;
    }
    if (!fs.existsSync(schemaPath)) {
      result = new IotResult(StatusResult.Error,`${errMsg}. ${schemaPath} file does not exist`);
      return result;
    }
    try {
      const file = fs.readFileSync(yamlFilePath, 'utf8');
      const yamlObj=YAML.parse(file);
      result=this.ValidateObjBySchema(yamlObj,schemaFileName);
    } catch (err: any){
      //result
      result = new IotResult(StatusResult.Error,`${errMsg} yamlFilePath = ${yamlFilePath}, schemaFileName = ${schemaFileName}`,err);
    }
    return result;
  }
 }
  