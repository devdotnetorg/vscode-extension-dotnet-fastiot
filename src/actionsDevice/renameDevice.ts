import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotDevice } from '../IotDevice';

export async function renameDevice(treeData: TreeDataDevicesProvider,item:IotDevice): Promise<void> {                    
    const newLabel = await vscode.window.showInputBox({				
        prompt: 'prompt',
        title: 'Enter a new name device',
        value:<string>item.label
    });
    if((newLabel==undefined)||(newLabel==item.label)) return;
    //Rename
    if(await treeData.RenameDevice(item,newLabel))
    {
        treeData.SaveDevices();
        treeData.Refresh();    
    }    
}

