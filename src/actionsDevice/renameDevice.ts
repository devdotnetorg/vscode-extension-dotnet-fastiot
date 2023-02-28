import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotDevice } from '../IotDevice';
import { IoTHelper } from '../Helper/IoTHelper';
import {IoTUI} from '../ui/IoTUI';

export async function renameDevice(treeData: TreeDataDevicesProvider,item:IotDevice,contextUI:IoTUI): Promise<void> {                    
    let newLabel = await vscode.window.showInputBox({				
        prompt: 'prompt',
        title: 'Enter a new name device',
        value:<string>item.label
    });
    if((newLabel==undefined)||(newLabel==item.label)) return;
    newLabel=IoTHelper.StringTrim(newLabel);
    //Rename
    if(await treeData.RenameDevice(item,newLabel)) {
        treeData.SaveDevices();
        treeData.Refresh();    
    }    
}

