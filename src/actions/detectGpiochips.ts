import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotDevice } from '../IotDevice';
import { IotDevicePackage } from '../IotDevicePackage';

export async function detectGpiochips(treeData: TreeDataDevicesProvider,item:IotDevice): Promise<void> {   
    treeData.OutputChannel.appendLine("----------------------------------");
    treeData.OutputChannel.appendLine("Action: detecting all GPIO chips");                
    const result=await treeData.DetectGpiochips(<string>item.IdDevice);
    //Output 
    treeData.OutputChannel.appendLine("------------- Result -------------");
    treeData.OutputChannel.appendLine(`Status: ${result.Status.toString()}`);
    treeData.OutputChannel.appendLine(`Message: ${result.Message}`);
    treeData.OutputChannel.appendLine(`System message: ${result.SystemMessage}`);
    //Message
    if(result.Status==StatusResult.Ok)
    {
        item.GpioChips.collapsibleState=vscode.TreeItemCollapsibleState.Expanded;
        treeData.Refresh(); 
        vscode.window.showInformationMessage(`All GPIO chips found successfully.`);       
    }else    
    {        
        vscode.window.showErrorMessage(`Error. Error while searching for GPIO chips. Device ${item.label} ${item.description}.`);            
    }         
}
