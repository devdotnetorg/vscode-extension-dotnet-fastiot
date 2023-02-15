import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as cp from "child_process";

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotDevice } from '../IotDevice';
import { BaseTreeItem } from '../BaseTreeItem';
import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';

export async function openTemplateFolder(treeData: TreeDataLaunchsProvider): Promise<void> {        
        const path=`explorer ${treeData.Config.Folder.Templates}`;
        cp.exec(path, undefined);
}
