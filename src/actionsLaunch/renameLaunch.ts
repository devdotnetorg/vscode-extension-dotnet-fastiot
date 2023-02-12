import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotLaunch } from '../IotLaunch';
import { IoTHelper } from '../Helper/IoTHelper';

export async function renameLaunch(treeData: TreeDataLaunchsProvider,item:IotLaunch): Promise<void> {                    
    let newLabel = await vscode.window.showInputBox({				
        prompt: 'prompt',
        title: 'Enter a new name launch',
        value:<string>item.label
    });
    if((newLabel==undefined)||(newLabel==item.label)) return;
    newLabel=IoTHelper.StringTrim(newLabel);
    if(newLabel==""){
        vscode.window.showErrorMessage(`Error. Empty name specified`);
        return;
    } 
    //Main process
    treeData.OutputChannel.appendLine(`Action: launch rename. Old name: ${item.label}. New name: ${newLabel}`);
    const result = await treeData.RenameLaunch(item,newLabel);
    //Output
    treeData.OutputChannel.appendLine("------------- Result -------------");
    treeData.OutputChannel.appendLine(`Status: ${result.Status.toString()}`);
    treeData.OutputChannel.appendLine(`Message: ${result.Message}`);
    treeData.OutputChannel.appendLine(`System message: ${result.SystemMessage}`);
    treeData.OutputChannel.appendLine("----------------------------------");
    //Message
    if(result.Status==StatusResult.Ok)
    {
        vscode.window.showInformationMessage('Launch rename succeeded');
    }else {
        vscode.window.showErrorMessage(`Error. Launch has not been renamed! \n${result.Message}. ${result.SystemMessage}`);
    }
    //Refresh
    treeData.RefreshsFull();
}

