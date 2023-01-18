import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotLaunchConfiguration } from '../IotLaunchConfiguration';

export async function deleteConfiguration(treeData: TreeDataLaunchsProvider,item:IotLaunchConfiguration): Promise<void> {                    
    await treeData.DeleteConfiguration(item.IdConfiguration);
    treeData.Refresh();
}

