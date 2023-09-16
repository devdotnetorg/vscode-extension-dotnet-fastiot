import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IoTHelper } from '../Helper/IoTHelper';
import * as jsonschema from 'jsonschema';

export class FilesValidator {
  private readonly _schemasFolderPath: string;
  
  constructor(schemasFolderPath: string){
      this._schemasFolderPath=schemasFolderPath;
  }
  
  public ValidateFiles (folderPath:string, schemaFileName:string, schemaOfSchemaFileName:string):IotResult
  {
    let result:IotResult;
    let validationErrors:Array<string>=[];
    let msg="";
    try {
      //check valid schema
      result = this.ValidateSchemaofFilesValidator(schemaFileName, schemaOfSchemaFileName);
      if(result.Status!=StatusResult.Ok) {
        throw new Error(result.toString());
      }
      //open schema
      const schemaPath=path.join(this._schemasFolderPath, schemaFileName);
      let dataFile:string= fs.readFileSync(schemaPath, 'utf8');
      let jsonSchema = JSON.parse(dataFile);
      jsonSchema.files.forEach((element:any) => {
        //values
        const type=element.type;
        const path=element.path;
        const description=element.description;
        //check
        let fullCheckPath=`${folderPath}${path}`;
        fullCheckPath=IoTHelper.ReverseSeparatorLinuxToWin(fullCheckPath);
        if (!fs.existsSync(fullCheckPath)) {
          //not found
          msg=`The ${type} does not exist. Path: ${fullCheckPath}. This ${type} is required: ${description}`;
          validationErrors.push(msg);
        }
      });
      result= new IotResult(StatusResult.Ok);
    } catch (err: any){
      //result
      result = new IotResult(StatusResult.Error,`VaidateFiles: pathFolder = ${folderPath}, schemaFileName = ${schemaFileName}`,err);
      validationErrors.push(result.toString());
    }
    result.returnObject=validationErrors;
    return result;
  }

  private ValidateSchemaofFilesValidator(schemaFileName:string, schemaOfSchemaFileName:string):IotResult {
    let result:IotResult;
    try {
      //open schemaOfschema file
      const schemaOfSchemaPath=path.join(this._schemasFolderPath, schemaOfSchemaFileName);
      const jsonSchemaOfSchemaData:string= fs.readFileSync(schemaOfSchemaPath, 'utf8');
      let jsonSchemaOfSchema = JSON.parse(jsonSchemaOfSchemaData);
      //open schema
      const schemaPath=path.join(this._schemasFolderPath, schemaFileName);
      const schemaData:string= fs.readFileSync(schemaPath, 'utf8');
      const jsonSchema = JSON.parse(schemaData);
      //
      let ValidatorSchemaFiles = new jsonschema.Validator();
      const options = {
        nestedErrors: true,
        allowUnknownAttributes:false,
        required:false,
        throwError:false,
        throwFirst:false,
        throwAll: true
      }
      jsonschema.ValidatorResult
      ValidatorSchemaFiles.validate(jsonSchema,jsonSchemaOfSchema,options);
      result= new IotResult(StatusResult.Ok);
    } catch (err: any){
      //result
      result = new IotResult(StatusResult.Error,`ValidateSchemaofFilesValidator: schemaFileName = ${schemaFileName}, schemaOfSchemaFileName = ${schemaOfSchemaFileName}`,err);
      if(err.errors) {
        const errors = <jsonschema.ValidationError[]>err.errors;
        if(errors.length>0) {
          const msgErr = `Error validating the ${schemaFileName} file using the ${schemaOfSchemaFileName} scheme. ${errors.toString()}`;
          result = new IotResult(StatusResult.Error,msgErr,err.toString());
        }
      }
    }
    return result;
  }
 }
  