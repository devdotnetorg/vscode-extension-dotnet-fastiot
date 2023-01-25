import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotLaunch } from '../IotLaunch';

export async function deleteConfiguration(treeData: TreeDataLaunchsProvider,item:IotLaunch): Promise<void> {                    
    await treeData.DeleteConfiguration(item.IdLaunch);
    treeData.Refresh();
}

