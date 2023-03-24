import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { LaunchNode } from '../LaunchNode';
import { IContexUI } from '../ui/IContexUI';

export async function deleteLaunch(treeData: TreeDataLaunchsProvider,item:LaunchNode,contextUI:IContexUI): Promise<void> {                    
    //Main process
    contextUI.Output(`Action: launch removal ${item.label} ${item.Launch.IdLaunch}`);
    contextUI.ShowBackgroundNotification(`Launch removal ${item.label} ${item.Launch.IdLaunch}`);
    const result = item.Launch.Remove();
    contextUI.HideBackgroundNotification();
    //Output
    contextUI.Output(result.toStringWithHead());
    //Message
    contextUI.ShowNotification(result);
    //Refresh
    treeData.RefreshsFull();
}
