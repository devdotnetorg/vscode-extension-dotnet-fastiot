import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { LaunchNode } from '../LaunchNode';
import { LaunchTreeItemNode } from '../LaunchTreeItemNode';

export async function gotoDevice(item:LaunchNode,treeViewDevices:vscode.TreeView<LaunchTreeItemNode>): Promise<void> {                    
    const device = item.Launch.Device;
    //Set focus
    if(device) {
        //IotDevice or string
        if(typeof device === "string") return;
        treeViewDevices.reveal(device, {focus: true});
    }else{
        vscode.window.showErrorMessage('Device not found.');
    } 
}
