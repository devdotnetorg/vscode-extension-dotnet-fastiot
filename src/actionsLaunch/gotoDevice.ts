import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { BaseTreeItem_d } from '../shared/BaseTreeItem_d';
import { LaunchNode } from '../LaunchNode';
import { LaunchTreeItemNode } from '../LaunchTreeItemNode';
import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';


export async function gotoDevice(item:LaunchNode,treeViewDevices:vscode.TreeView<BaseTreeItem_d>,treeDataDevicesProvider:TreeDataDevicesProvider): Promise<void> {                    
    const sourceDevice=item.Launch.Device;
    if(!sourceDevice) return;
    if(typeof sourceDevice === "string") return;
    if(!sourceDevice.IdDevice) return;
    //find device
    const device = treeDataDevicesProvider.FindbyIdDevice(sourceDevice.IdDevice);
    //Set focus
    if(device) {
        //IotDevice or string
        if(typeof device === "string") return;
        treeViewDevices.reveal(device, {focus: true});
    }else{
        vscode.window.showErrorMessage('Device not found.');
    } 
}
