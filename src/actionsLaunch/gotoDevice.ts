import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotLaunch } from '../IotLaunch';
import { BaseTreeItem } from '../BaseTreeItem';

export async function gotoDevice(item:IotLaunch,treeViewDevices:vscode.TreeView<BaseTreeItem>): Promise<void> {                    
    const device = item.Device;
    //Set focus
    if(device) {
        treeViewDevices.reveal(device, {focus: true});
    }else{
        vscode.window.showErrorMessage('Device not found.');
    } 
}
