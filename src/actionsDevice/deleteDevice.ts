import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotDevice } from '../IotDevice';

export async function deleteDevice(treeData: TreeDataDevicesProvider,item:IotDevice): Promise<void> {
    const answer = await vscode.window.showInformationMessage(`Do you really want to remove the device:
        ${item.label} ${item.description}?`, ...["Yes", "No"]);
    if(answer=="Yes") {
        treeData.OutputChannel.appendLine(`Action: remove device ${item.label} ${item.IdDevice}`);
        const result=await treeData.DeleteDevice(<string>item.IdDevice);
        //Output       
        treeData.OutputChannel.appendLine("------------- Result -------------");
        treeData.OutputChannel.appendLine(`Status: ${result.toString()}`);
        treeData.OutputChannel.appendLine("----------------------------------");  
        //Message
        if(result) {
            treeData.SaveDevices();
            treeData.Refresh();
            vscode.window.showInformationMessage(`${item.label} ${item.description} device removed successfully.`);
        }else {
            vscode.window.showErrorMessage(`Error. ${item.label} ${item.description} device could not be deleted.`);         
        }      
    }
}
