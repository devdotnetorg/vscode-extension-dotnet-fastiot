import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotLaunch } from '../IotLaunch';
import {IoTUI} from '../ui/IoTUI';

export async function deleteLaunch(treeData: TreeDataLaunchsProvider,item:IotLaunch,contextUI:IoTUI): Promise<void> {                    
    //Main process
    contextUI.Output(`Action: launch removal ${item.label} ${item.IdLaunch}`);
    contextUI.StatusBarBackground.showAnimation(`Launch removal ${item.label} ${item.IdLaunch}`);
    const result = await treeData.DeleteLaunch(item.IdLaunch);
    contextUI.StatusBarBackground.hide();
    //Output
    contextUI.Output(result.toMultiLineString("head"));
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
