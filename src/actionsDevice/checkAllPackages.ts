import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotDevice } from '../IotDevice';
import {IoTUI} from '../ui/IoTUI';

export async function checkAllPackages(treeData: TreeDataDevicesProvider,item:IotDevice,contextUI:IoTUI): Promise<void> {   
    contextUI.Output("Action: checking all packages");
    contextUI.StatusBarBackground.showAnimation("Checking all packages");
    const result=await treeData.CheckAllPackages(<string>item.IdDevice);
    contextUI.StatusBarBackground.hide();
    //Output 
    contextUI.Output(result.toMultiLineString("head"));
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
