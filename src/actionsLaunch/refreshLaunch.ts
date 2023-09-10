import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../LaunchView/TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IContexUI } from '../ui/IContexUI';

export async function refreshLaunch(treeData: TreeDataLaunchsProvider,contextUI:IContexUI): Promise<void> {
    //Main process
    const result = treeData.LoadLaunches();
    //Output
    if(result.Status==StatusResult.Error) contextUI.Output(result);
    //Message
    contextUI.ShowNotification(result);
}
