import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataConfigurationsProvider } from '../TreeDataConfigurationsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotLaunchConfiguration } from '../IotLaunchConfiguration';

export async function rebuildConfiguration(treeData: TreeDataConfigurationsProvider,item:IotLaunchConfiguration): Promise<void> {                    
    await treeData.RebuildConfiguration(item.IdConfiguration);
    treeData.Refresh();
    vscode.window.showInformationMessage("Configuration rebuild completed successfully");
}

