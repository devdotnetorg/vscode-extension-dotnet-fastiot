import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {IoTHelper} from '../Helper/IoTHelper';

export async function openFolderKeys(pathFolderKeys:string): Promise<void> {
        IoTHelper.ShowExplorer(pathFolderKeys);
}
