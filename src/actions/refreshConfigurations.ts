import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataConfigurationsProvider } from '../TreeDataConfigurationsProvider';
import { IotResult,StatusResult } from '../IotResult';

export async function refreshConfigurations(treeData: TreeDataConfigurationsProvider): Promise<void> {        
    treeData.RefreshsFull();
    vscode.window.showInformationMessage("Refresh configurations");
}

