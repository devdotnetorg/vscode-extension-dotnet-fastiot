import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataConfigurationsProvider } from '../TreeDataConfigurationsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotLaunchConfiguration } from '../IotLaunchConfiguration';

export async function deleteConfiguration(treeData: TreeDataConfigurationsProvider,item:IotLaunchConfiguration): Promise<void> {                    
    await treeData.DeleteConfiguration(item.IdConfiguration);
    treeData.Refresh();
}

