import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../IotResult';

export async function refreshLaunch(treeData: TreeDataLaunchsProvider): Promise<void> {        
    treeData.RefreshsFull();
    vscode.window.showInformationMessage("Refresh launchs");
}
