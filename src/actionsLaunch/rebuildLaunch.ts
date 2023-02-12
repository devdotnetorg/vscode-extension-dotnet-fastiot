import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotLaunch } from '../IotLaunch';

export async function rebuildLaunch(treeData: TreeDataLaunchsProvider,item:IotLaunch): Promise<void> {
     //Main process
     treeData.OutputChannel.appendLine(`Action: rebuild Launch. Launch: ${item.label}`);
     const result = await treeData.RebuildLaunch(item.IdLaunch);
     //Output
     treeData.OutputChannel.appendLine("------------- Result -------------");
     treeData.OutputChannel.appendLine(`Status: ${result.Status.toString()}`);
     treeData.OutputChannel.appendLine(`Message: ${result.Message}`);
     treeData.OutputChannel.appendLine(`System message: ${result.SystemMessage}`);
     treeData.OutputChannel.appendLine("----------------------------------");
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

