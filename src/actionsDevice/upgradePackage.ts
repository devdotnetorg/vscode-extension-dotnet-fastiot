import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { pingDevice } from './pingDevice';
import { IotDevice } from '../IotDevice';
import { TypePackage,IotDevicePackage } from '../IotDevicePackage';
import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { installPackage } from './installPackage';

export async function upgradePackage(treeData: TreeDataDevicesProvider,item:IotDevicePackage): Promise<void> {
    await installPackage(treeData,item);        
}
