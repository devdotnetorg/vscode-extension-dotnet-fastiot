import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TypePackage,IotDevicePackage } from '../IotDevicePackage';
import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { installPackage } from './installPackage';
import {IoTUI} from '../ui/IoTUI';

export async function upgradePackage(treeData: TreeDataDevicesProvider,item:IotDevicePackage,contextUI:IoTUI): Promise<void> {
    await installPackage(treeData,item,contextUI);        
}
