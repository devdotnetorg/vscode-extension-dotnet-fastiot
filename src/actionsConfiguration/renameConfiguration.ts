import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataConfigurationsProvider } from '../TreeDataConfigurationsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotLaunchConfiguration } from '../IotLaunchConfiguration';

export async function renameConfiguration(treeData: TreeDataConfigurationsProvider,item:IotLaunchConfiguration): Promise<void> {                    
    const newLabel = await vscode.window.showInputBox({				
        prompt: 'prompt',
        title: 'Enter a new name configuration',
        value:<string>item.label
    });
    if((newLabel==undefined)||(newLabel==item.label)) return;
    //Rename
    if(await treeData.RenameConfiguration(item,newLabel))
    {        
        treeData.Refresh();    
    }    
}

