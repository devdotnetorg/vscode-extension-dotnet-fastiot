import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {IotResult,StatusResult } from '../IotResult';

export class YamlSchemaValidator {  
  private _pathFolderSchemas: string;
  
  constructor(PathFolderSchemas: string){
      this._pathFolderSchemas=PathFolderSchemas;
  }

  public ValidateSchema (pathFileYml:string, schemaFileName:string):IotResult
  {
    let result:IotResult;
    try {
      const validateSchema = require('yaml-schema-validator');
      // validate a yml file
      const schemaPath=`${this._pathFolderSchemas}\\${schemaFileName}`;
      // schemaErrors = [{path: 'person.id', message: 'person.id must be a String'}]
      var schemaErrors = validateSchema(pathFileYml,
        {
          schemaPath: schemaPath,
          logLevel: 'error'
        }
      );
      result = new IotResult(StatusResult.Ok,undefined,undefined);
      result.returnObject=schemaErrors;
    } catch (err: any){
      //result
      result = new IotResult(StatusResult.Error,`VaidateSchema: pathFileYml = ${pathFileYml}, schemaFileName = ${schemaFileName}`,err);
    }
    return result;
  }
 }
  