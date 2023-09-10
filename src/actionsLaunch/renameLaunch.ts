import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../LaunchView/TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { LaunchNode } from '../LaunchView/LaunchNode';
import { IoTHelper } from '../Helper/IoTHelper';
import { IContexUI } from '../ui/IContexUI';

export async function renameLaunch(treeData: TreeDataLaunchsProvider,item:LaunchNode,contextUI:IContexUI): Promise<void> {                    
    let newLabel = await vscode.window.showInputBox({				
        prompt: 'prompt',
        title: 'Enter a new name launch',
        value:<string>item.label
    });
    if((!newLabel)||(newLabel==item.label)) return;
    newLabel=IoTHelper.StringTrim(newLabel);
    let result:IotResult;
    if(newLabel==""){
        result=new IotResult(StatusResult.Error,`Empty name specified`);
        contextUI.ShowNotification(result);
        return;
    } 
    //Main process
    contextUI.Output(`Action: launch rename. Old name: ${item.label}. New name: ${newLabel}`);
    //contextUI.ShowBackgroundNotification(`Launch rename. Old name: ${item.label}. New name: ${newLabel}`);
    result = item.Launch.Rename(newLabel);
    //contextUI.HideBackgroundNotification();
    //Output
    contextUI.Output(result.toStringWithHead());
    //Message
    //contextUI.ShowNotification(result);
    //Refresh
    treeData.LoadLaunches();
}
