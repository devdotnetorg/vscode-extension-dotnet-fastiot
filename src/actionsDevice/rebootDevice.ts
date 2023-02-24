import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotDevice } from '../IotDevice';

export async function rebootDevice(treeData: TreeDataDevicesProvider,item:IotDevice, firstText:string|undefined): Promise<void> { 
    let textMessage:string;
    if(firstText) {
        textMessage=`${firstText}. Reboot your device: 
        ${item.label} ${item.description}?`;
    } else {
        textMessage=`Do you really want to reboot the device: 
        ${item.label} ${item.description}?`;
    }
    //    
    const answer = await vscode.window.showInformationMessage(textMessage, ...["Yes", "No"]);
    if(answer=="Yes") {
        const device = treeData.FindbyIdDevice(<string>item.IdDevice);    
        if(device) {
            treeData.OutputChannel.appendLine("Action: reboot device");
            const result = await device.Reboot();
            //Output       
            treeData.OutputChannel.appendLine("------------- Result -------------");
            treeData.OutputChannel.appendLine(`Status: ${result.Status.toString()}`);
            treeData.OutputChannel.appendLine(`Message: ${result.Message}`);
            treeData.OutputChannel.appendLine(`System message: ${result.SystemMessage}`);
            treeData.OutputChannel.appendLine("----------------------------------");
            //Message                 
            if(result.Status==StatusResult.Ok) {
                vscode.window.showInformationMessage(`Reboot completed successfully. 
                    Device: ${item.label} ${item.description}`);
            } else {            
                vscode.window.showErrorMessage(`Error. Failed to reboot device! ${result.Message}`);
                if(result.SystemMessage) 
                    treeData.OutputChannel.appendLine(result.SystemMessage);
            }       
        }
    }
}
