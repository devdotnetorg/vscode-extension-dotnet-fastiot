import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { LaunchNode } from '../LaunchNode';
import { IContexUI } from '../ui/IContexUI';

export async function rebuildLaunch(treeData: TreeDataLaunchsProvider,item:LaunchNode,contextUI:IContexUI): Promise<void> {
     //Main process
     contextUI.Output(`Action: rebuild Launch. Launch: ${item.label}`);
     contextUI.ShowBackgroundNotification(`Rebuild Launch. Launch: ${item.label}`);
     const result = await treeData.RebuildLaunch(item.IdLaunch);
     contextUI.HideBackgroundNotification();
     //Output
     contextUI.Output(result.toStringWithHead());
     //Message
     if(result.Status==StatusResult.Ok)
     {
        vscode.window.showInformationMessage("Configuration rebuild completed successfully");
     }else {
         vscode.window.showErrorMessage(`Error. Rebuild is not completed! \n${result.Message}. ${result.SystemMessage}`);            
     }
     //Refresh
     treeData.RefreshsFull();
}
