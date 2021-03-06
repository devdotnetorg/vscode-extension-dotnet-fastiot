import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataConfigurationsProvider } from '../TreeDataConfigurationsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotLaunchConfiguration } from '../IotLaunchConfiguration';
import { BaseTreeItem } from '../BaseTreeItem';
import { IotDevice } from '../IotDevice';

export async function gotoDevice(treeData: TreeDataConfigurationsProvider,item:IotLaunchConfiguration,treeViewDevices:vscode.TreeView<BaseTreeItem>): Promise<void> {                    
    const device = <BaseTreeItem>treeData.FindbyIdConfiguration(item.IdConfiguration)?.Device;
    //Set focus    
    treeViewDevices.reveal(device, {focus: true});
}

