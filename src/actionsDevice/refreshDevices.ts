import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../IotResult';

export async function refreshDevices(treeData: TreeDataDevicesProvider): Promise<void> {        
    treeData.RefreshsFull();
    vscode.window.showInformationMessage("Refresh devices");
}
