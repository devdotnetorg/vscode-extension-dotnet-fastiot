import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../LaunchView/TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { LaunchNode } from '../LaunchView/LaunchNode';
import { AppDomain } from '../AppDomain';

export async function deleteLaunch(treeData: TreeDataLaunchsProvider,item:LaunchNode): Promise<void> {                    
    //Main process
    const app = AppDomain.getInstance().CurrentApp;
    app.UI.Output(`Action: launch removal ${item.label} ${item.Launch.IdLaunch}`);
    //contextUI.ShowBackgroundNotification(`Launch removal ${item.label} ${item.Launch.IdLaunch}`);
    const result = item.Launch.Remove();
    //contextUI.HideBackgroundNotification();
    //Output
    app.UI.Output(result.toStringWithHead());
    //Message
    app.UI.ShowNotification(result);
    //Refresh
    treeData.LoadLaunches();
}
