import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotLaunch } from '../IotLaunch';

export async function renameConfiguration(treeData: TreeDataLaunchsProvider,item:IotLaunch): Promise<void> {                    
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

