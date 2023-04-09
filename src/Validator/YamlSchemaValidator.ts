import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IotResult,StatusResult } from '../IotResult';

export class YamlSchemaValidator {  
  private _pathFolderSchemas: string;
  
  constructor(PathFolderSchemas: string){
      this._pathFolderSchemas=PathFolderSchemas;
  }

  public ValidateSchema (yamlFilePath:string, schemaFileName:string):IotResult
  {
    let result:IotResult;
    let validationErrors:Array<string>=[];
    let msg="";
    try {
      //source - https://www.npmjs.com/package/yaml-schema-validator-fork
      const validateSchema = require('yaml-schema-validator-fork');
      // validate a yml file
      const schemaPath=`${this._pathFolderSchemas}\\${schemaFileName}`;
      var schemaErrors = validateSchema(yamlFilePath,
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
      result = new IotResult(StatusResult.Ok);
    } catch (err: any){
      //result
      result = new IotResult(StatusResult.Error,`VaidateSchema: pathFileYml = ${yamlFilePath}, schemaFileName = ${schemaFileName}`,err);
      validationErrors.push(result.toString());
    }
    result.returnObject=validationErrors;
    return result;
  }
 }
  