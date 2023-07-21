import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IotDevice } from '../IotDevice';
import { IotTemplate } from '../Templates/IotTemplate';

export interface IYamlValidator {
  ValidateObjBySchema (yamlObj:any, schemaFileName:string):IotResult;
  ValidateFileBySchema (yamlFilePath:string, schemaFileName:string):IotResult;
}
