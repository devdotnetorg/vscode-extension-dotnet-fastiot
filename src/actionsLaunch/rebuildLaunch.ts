import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotLaunch } from '../IotLaunch';
import {IoTUI} from '../ui/IoTUI';

export async function rebuildLaunch(treeData: TreeDataLaunchsProvider,item:IotLaunch,contextUI:IoTUI): Promise<void> {
     //Main process
     contextUI.Output(`Action: rebuild Launch. Launch: ${item.label}`);
     contextUI.StatusBarBackground.showAnimation(`Rebuild Launch. Launch: ${item.label}`);
     const result = await treeData.RebuildLaunch(item.IdLaunch);
     contextUI.StatusBarBackground.hide();
     //Output
     contextUI.Output(result.toMultiLineString("head"));
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
