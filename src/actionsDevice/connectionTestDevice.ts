import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotDevice } from '../IotDevice';

export async function connectionTestDevice(treeData: TreeDataDevicesProvider,item:IotDevice): Promise<void> {   
    const device= treeData.FindbyIdDevice(<string>item.IdDevice);
    if(device) {
        treeData.OutputChannel.appendLine("Action: connection test device");
        treeData.ShowStatusBar("Checking the network connection");
        const result = await device.ConnectionTest();
        treeData.HideStatusBar();
        //Output       
        treeData.OutputChannel.appendLine("------------- Result -------------");
        treeData.OutputChannel.appendLine(`Status: ${result.Status.toString()}`);
        treeData.OutputChannel.appendLine(`Message: ${result.Message}`);
        treeData.OutputChannel.appendLine(`System message: ${result.SystemMessage}`);
        treeData.OutputChannel.appendLine("----------------------------------");
        //Message          
        if(result.Status==StatusResult.Ok) {
            vscode.window.showInformationMessage(`Connection to host ${device.Account.Host} via ssh 
            with ${device.Account.Identity} key completed successfully.`);
        } else {         
            vscode.window.showErrorMessage(`Unable to connect to host ${device.Account.Host} via ssh 
            with ${device.Account.Identity} key.`);            
        }
    } else {
        vscode.window.showErrorMessage(`Device ${item.IdDevice} not found`);
    }
}
