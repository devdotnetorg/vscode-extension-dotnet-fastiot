import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotDevice } from '../IotDevice';

export async function shutdownDevice(treeData: TreeDataDevicesProvider,item:IotDevice, firstText:string|undefined): Promise<void> { 
    let textMessage:string;
    if(firstText){
        textMessage=`${firstText}. Shutdown your device: 
        ${item.label} ${item.description}?`;

    }else
    {
        textMessage=`Do you really want to shutdown the device: 
        ${item.label} ${item.description}?`;
    }
    //    
    const answer = await vscode.window.showInformationMessage(textMessage, ...["Yes", "No"]);
    if(answer=="Yes")
    {
        const device = treeData.FindbyIdDevice(<string>item.IdDevice);    
        if(device){
            treeData.OutputChannel.appendLine("----------------------------------");
            treeData.OutputChannel.appendLine("Action: shutdown device");
            const result = await device.Shutdown();
            //Output       
            treeData.OutputChannel.appendLine("------------- Result -------------");
            treeData.OutputChannel.appendLine(`Status: ${result.Status.toString()}`);
            treeData.OutputChannel.appendLine(`Message: ${result.Message}`);
            treeData.OutputChannel.appendLine(`System message: ${result.SystemMessage}`);
            //Message                 
            if(result.Status==StatusResult.Ok)
            {
                vscode.window.showInformationMessage(`Shutdown completed successfully. 
                    Device: ${item.label} ${item.description}`);
                //
                vscode.window.showInformationMessage(`Wait a while for the device to turn off completely`);                
            }else
            {            
                vscode.window.showErrorMessage(`Error. Failed to shutdown device! ${result.Message}`);
                if(result.SystemMessage) treeData.OutputChannel.appendLine(result.SystemMessage);
            }            
        }
    }      
}
