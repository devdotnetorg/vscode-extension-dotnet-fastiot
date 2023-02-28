import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotLaunch } from '../IotLaunch';
import { IoTHelper } from '../Helper/IoTHelper';
import {IoTUI} from '../ui/IoTUI';

export async function renameLaunch(treeData: TreeDataLaunchsProvider,item:IotLaunch,contextUI:IoTUI): Promise<void> {                    
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
    contextUI.Output(`Action: launch rename. Old name: ${item.label}. New name: ${newLabel}`);
    contextUI.StatusBarBackground.showAnimation(`Launch rename. Old name: ${item.label}. New name: ${newLabel}`);
    const result = await treeData.RenameLaunch(item,newLabel);
    contextUI.StatusBarBackground.hide();
    //Output
    contextUI.Output(result.toMultiLineString("head"));
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
