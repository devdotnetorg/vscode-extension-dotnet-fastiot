import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../LaunchView/TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { LaunchNode } from '../LaunchView/LaunchNode';
import { IoTHelper } from '../Helper/IoTHelper';
import { AppDomain } from '../AppDomain';

export async function renameLaunch(treeData: TreeDataLaunchsProvider,item:LaunchNode): Promise<void> {                    
    let newLabel = await vscode.window.showInputBox({				
        prompt: 'prompt',
        title: 'Enter a new name launch',
        value:<string>item.label
    });
    if((!newLabel)||(newLabel==item.label)) return;
    newLabel=IoTHelper.StringTrim(newLabel);
    let result:IotResult;
    const app = AppDomain.getInstance().CurrentApp;
    if(newLabel==""){
        result=new IotResult(StatusResult.Error,`Empty name specified`);
        app.UI.ShowNotification(result);
        return;
    } 
    //Main process
    app.UI.Output(`Action: launch rename. Old name: ${item.label}. New name: ${newLabel}`);
    //contextUI.ShowBackgroundNotification(`Launch rename. Old name: ${item.label}. New name: ${newLabel}`);
    result = item.Launch.Rename(newLabel);
    //contextUI.HideBackgroundNotification();
    //Output
    app.UI.Output(result.toStringWithHead());
    //Message
    //contextUI.ShowNotification(result);
    //Refresh
    treeData.LoadLaunches();
}
