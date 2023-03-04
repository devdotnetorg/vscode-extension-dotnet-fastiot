import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { LaunchNode } from '../LaunchNode';
import { IContexUI } from '../ui/IContexUI';

export async function deleteLaunch(treeData: TreeDataLaunchsProvider,item:LaunchNode,contextUI:IContexUI): Promise<void> {                    
    //Main process
    contextUI.Output(`Action: launch removal ${item.label} ${item.IdLaunch}`);
    contextUI.ShowBackgroundNotification(`Launch removal ${item.label} ${item.IdLaunch}`);
    const result = await treeData.DeleteLaunch(item.IdLaunch);
    contextUI.HideBackgroundNotification();
    //Output
    contextUI.Output(result.toStringWithHead());
    //Message
    if(result.Status==StatusResult.Ok)
    {
        vscode.window.showInformationMessage('Launch successfully removed');
    }else {
        vscode.window.showErrorMessage(`Error. Launch is not deleted! \n${result.Message}. ${result.SystemMessage}`);            
    }
    //Refresh
    treeData.RefreshsFull();
}
