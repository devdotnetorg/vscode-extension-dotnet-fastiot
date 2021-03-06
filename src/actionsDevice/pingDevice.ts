import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotDevice } from '../IotDevice';

export async function pingDevice(treeData: TreeDataDevicesProvider,item:IotDevice): Promise<void> {   
    const device=await treeData.FindbyIdDevice(<string>item.IdDevice);
    if(device)
    {
        treeData.OutputChannel.appendLine("----------------------------------");
        treeData.OutputChannel.appendLine("Action: ping device");
        const result = await device.Ping(); 
        //Output       
        treeData.OutputChannel.appendLine("------------- Result -------------");
        treeData.OutputChannel.appendLine(`Status: ${result.Status.toString()}`);
        treeData.OutputChannel.appendLine(`Message: ${result.Message}`);
        treeData.OutputChannel.appendLine(`System message: ${result.SystemMessage}`);
        //Message          
        if(result.Status==StatusResult.Ok)
        {
            vscode.window.showInformationMessage(`Connection to host ${device.Account.Host} via ssh 
            with ${device.Account.Identity} key completed successfully.`);
        }else
        {            
            vscode.window.showErrorMessage(`Unable to connect to host ${device.Account.Host} via ssh 
            with ${device.Account.Identity} key.`);            
        }  
    }else
    {
        vscode.window.showErrorMessage(`Device ${item.IdDevice} not found`);
    }    
}
