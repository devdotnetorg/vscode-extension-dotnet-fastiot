import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {IotResult,StatusResult } from '../IotResult';
import {IoTHelper} from '../Helper/IoTHelper';

export class FilesValidator {
  private _pathFolderSchemas: string;
  
  constructor(PathFolderSchemas: string){
      this._pathFolderSchemas=PathFolderSchemas;
  }
  
  public ValidateFiles (pathFolder:string, schemaFileName:string):IotResult
  {
    let result:IotResult;
    let validationErrors:Array<string>=[];
    let msg="";
    try {
      //open schema
      const schemaPath=`${this._pathFolderSchemas}\\${schemaFileName}`;
      let dataFile:string= fs.readFileSync(schemaPath, 'utf8');
      let jsonSchema = JSON.parse(dataFile);
      jsonSchema.files.forEach((element:any) => {
        //values
        const type=element.type;
        const path=element.path;
        const description=element.description;
        //check
        let fullCheckPath=`${pathFolder}${path}`;
        fullCheckPath=IoTHelper.ReverseSeparatorLinuxToWin(fullCheckPath);
        if (!fs.existsSync(fullCheckPath))
        {
          //not found
          msg=`The ${type} does not exist. Path: ${fullCheckPath}. This ${type} is required: ${description}`;
          validationErrors.push(msg);
        }
      });
      result= new IotResult(StatusResult.Ok,undefined,undefined);
    } catch (err: any){
      //result
      result = new IotResult(StatusResult.Error,`VaidateFiles: pathFolder = ${pathFolder}, schemaFileName = ${schemaFileName}`,err);
      validationErrors.push(result.toString());
    }
    result.returnObject=validationErrors;
    return result;
  }
 }
  