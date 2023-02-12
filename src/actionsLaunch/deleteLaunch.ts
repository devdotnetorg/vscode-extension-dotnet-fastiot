import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotLaunch } from '../IotLaunch';

export async function deleteLaunch(treeData: TreeDataLaunchsProvider,item:IotLaunch): Promise<void> {                    
    //Main process
    treeData.OutputChannel.appendLine(`Action: launch removal ${item.label} ${item.IdLaunch}`);
    const result = await treeData.DeleteLaunch(item.IdLaunch);
    //Output
    treeData.OutputChannel.appendLine("------------- Result -------------");
    treeData.OutputChannel.appendLine(`Status: ${result.Status.toString()}`);
    treeData.OutputChannel.appendLine(`Message: ${result.Message}`);
    treeData.OutputChannel.appendLine(`System message: ${result.SystemMessage}`);
    treeData.OutputChannel.appendLine("----------------------------------");
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

