import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotDevice } from '../IotDevice';

export async function checkAllPackages(treeData: TreeDataDevicesProvider,item:IotDevice): Promise<void> {   
    treeData.OutputChannel.appendLine("Action: checking all packages");                
    const result=await treeData.CheckAllPackages(<string>item.IdDevice);
    //Output 
    treeData.OutputChannel.appendLine("------------- Result -------------");
    treeData.OutputChannel.appendLine(`Status: ${result.Status.toString()}`);
    treeData.OutputChannel.appendLine(`Message: ${result.Message}`);
    treeData.OutputChannel.appendLine(`System message: ${result.SystemMessage}`);
    treeData.OutputChannel.appendLine("----------------------------------");
    //Message
    if(result.Status==StatusResult.Ok)
    {
        item.PackagesLinux.collapsibleState=vscode.TreeItemCollapsibleState.Expanded;
        treeData.Refresh(); 
        vscode.window.showInformationMessage(`Successfully checked for all packages.`);       
    }else    
    {        
        vscode.window.showErrorMessage(`Error. Error checking for package presence. Device ${item.label} ${item.description}.`);            
    }         
}
