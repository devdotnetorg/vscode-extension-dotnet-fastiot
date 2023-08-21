import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import { IoT } from '../Types/Enums';
import EntityEnum = IoT.Enums.Entity;

export interface IConfigSbcCollection {
  getProfilesSBCJson(): string;
  setProfilesSBCJson(value:string):void;
}
