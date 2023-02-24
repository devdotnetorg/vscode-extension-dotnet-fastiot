import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TypePackage,IotDevicePackage } from '../IotDevicePackage';
import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { installPackage } from './installPackage';

export async function upgradePackage(treeData: TreeDataDevicesProvider,item:IotDevicePackage): Promise<void> {
    await installPackage(treeData,item);        
}
