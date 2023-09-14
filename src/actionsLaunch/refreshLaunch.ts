import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../LaunchView/TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { AppDomain } from '../AppDomain';

export async function refreshLaunch(treeData: TreeDataLaunchsProvider): Promise<void> {
    const app = AppDomain.getInstance().CurrentApp;
    //Main process
    const result = treeData.LoadLaunches();
    //Output
    if(result.Status==StatusResult.Error) app.UI.Output(result);
    //Message
    app.UI.ShowNotification(result);
}
