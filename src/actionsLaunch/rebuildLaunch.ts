import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotLaunch } from '../IotLaunch';

export async function rebuildLaunch(treeData: TreeDataLaunchsProvider,item:IotLaunch): Promise<void> {                    
    await treeData.RebuildLaunch(item.IdLaunch);
    treeData.Refresh();
    vscode.window.showInformationMessage("Configuration rebuild completed successfully");
}

