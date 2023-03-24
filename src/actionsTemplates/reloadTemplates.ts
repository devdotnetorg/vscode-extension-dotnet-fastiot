import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { IotResult,StatusResult } from '../IotResult';
import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';

export async function reloadTemplates(treeData: TreeDataLaunchsProvider): Promise<void> {        
    treeData.Config.LoadTemplatesAsync(true);
}
