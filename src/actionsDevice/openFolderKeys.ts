import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as cp from "child_process";

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';

export async function openFolderKeys(treeData: TreeDataDevicesProvider): Promise<void> {
        const path=`explorer ${treeData.Config.Folder.DeviceKeys}`;
        cp.exec(path, undefined);
}
