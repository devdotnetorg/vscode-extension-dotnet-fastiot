import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotDevice } from '../IotDevice';
import { IotDeviceDTO } from '../IotDeviceDTO';

export async function refreshDTO(treeData: TreeDataDevicesProvider,item:IotDevice): Promise<void> {   
    treeData.OutputChannel.appendLine("Action: retrieving all DTOs");                
    const result=await treeData.GetAllDTO(<string>item.IdDevice);
    //Output 
    treeData.OutputChannel.appendLine("------------- Result -------------");
    treeData.OutputChannel.appendLine(`Status: ${result.Status.toString()}`);
    treeData.OutputChannel.appendLine(`Message: ${result.Message}`);
    treeData.OutputChannel.appendLine(`System message: ${result.SystemMessage}`);
    treeData.OutputChannel.appendLine("----------------------------------");
    //Message
    if(result.Status==StatusResult.Ok) {
        item.DtoLinux.collapsibleState=vscode.TreeItemCollapsibleState.Expanded;
        treeData.Refresh(); 
        vscode.window.showInformationMessage(`All DTOs have been successfully received.`);       
    } else {        
        vscode.window.showErrorMessage(`Error. Error getting DTOs. ${result.Message}.`);            
    }
}
