import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IotDevice } from '../IotDevice';
import {IContexUI} from '../ui/IContexUI';

export async function refreshDTO(treeData: TreeDataDevicesProvider,item:IotDevice,contextUI:IContexUI): Promise<void> {   
    contextUI.Output("Action: retrieving all DTOs");
    contextUI.ShowBackgroundNotification("Retrieving all DTOs");              
    const result=await treeData.GetAllDTO(<string>item.IdDevice);
    contextUI.HideBackgroundNotification();
    //Output 
    contextUI.Output(result.toStringWithHead());
    //Message
    if(result.Status==StatusResult.Ok) {
        item.DtoLinux.collapsibleState=vscode.TreeItemCollapsibleState.Expanded;
        treeData.Refresh(); 
        vscode.window.showInformationMessage(`All DTOs have been successfully received.`);       
    } else {        
        vscode.window.showErrorMessage(`Error. Error getting DTOs. ${result.Message}.`);            
    }
}
