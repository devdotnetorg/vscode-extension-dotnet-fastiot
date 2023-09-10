import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {IoTHelper} from '../Helper/IoTHelper';
import {networkHelper} from '../Helper/networkHelper';
import { IotResult,StatusResult } from '../Shared/IotResult';

export async function openTemplateFolder(pathFolderTemplates:string): Promise<void> {
        IoTHelper.ShowExplorer(pathFolderTemplates); 
}
