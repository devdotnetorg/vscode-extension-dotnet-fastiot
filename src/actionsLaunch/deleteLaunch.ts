import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotLaunch } from '../IotLaunch';

export async function deleteLaunch(treeData: TreeDataLaunchsProvider,item:IotLaunch): Promise<void> {                    
    await treeData.DeleteLaunch(item.IdLaunch);
    treeData.Refresh();
}

