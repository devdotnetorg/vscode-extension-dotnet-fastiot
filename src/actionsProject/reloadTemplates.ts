import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotDevice } from '../IotDevice';
import { BaseTreeItem } from '../BaseTreeItem';
import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import * as cp from "child_process";

export async function reloadTemplates(treeData: TreeDataLaunchsProvider): Promise<void> {        
    treeData.Config.LoadTemplates();
}
