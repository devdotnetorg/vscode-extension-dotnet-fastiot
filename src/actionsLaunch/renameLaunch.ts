import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotLaunch } from '../IotLaunch';

export async function renameLaunch(treeData: TreeDataLaunchsProvider,item:IotLaunch): Promise<void> {                    
    const newLabel = await vscode.window.showInputBox({				
        prompt: 'prompt',
        title: 'Enter a new name launch',
        value:<string>item.label
    });
    if((newLabel==undefined)||(newLabel==item.label)) return;
    //Rename
    if(await treeData.RenameLaunch(item,newLabel))
    {        
        treeData.Refresh();    
    }    
}

