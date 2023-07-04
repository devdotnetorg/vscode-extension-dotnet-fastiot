import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IotResult,StatusResult } from '../IotResult';
import { IotDevice } from '../IotDevice';
import { IotTemplate } from '../Templates/IotTemplate';
import { LogLevel } from '../shared/LogLevel';

export interface IYamlValidator {
  ValidateSchema (yamlFilePath:string, schemaFileName:string):IotResult;
}
