import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotLaunch } from '../IotLaunch';
import { BaseTreeItem } from '../BaseTreeItem';
import { IotDevice } from '../IotDevice';

export async function gotoDevice(treeData: TreeDataLaunchsProvider,item:IotLaunch,treeViewDevices:vscode.TreeView<BaseTreeItem>): Promise<void> {                    
    const device = <BaseTreeItem>treeData.FindbyIdConfiguration(item.IdLaunch)?.Device;
    //Set focus    
    treeViewDevices.reveal(device, {focus: true});
}

