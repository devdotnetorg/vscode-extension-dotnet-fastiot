import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { IotDevice } from '../IotDevice';
import {IContexUI} from '../ui/IContexUI';

export async function checkAllPackages(treeData: TreeDataDevicesProvider,item:IotDevice,contextUI:IContexUI): Promise<void> {   
    contextUI.Output("Action: checking all packages");
    const labelTask="Checking all packages";
    contextUI.ShowBackgroundNotification(labelTask);
    const guidBadge=contextUI.BadgeAddItem(labelTask);
    const result=await treeData.CheckAllPackages(<string>item.IdDevice);
    if(guidBadge)contextUI.BadgeDeleteItem(guidBadge);
    contextUI.HideBackgroundNotification();
    //Output 
    contextUI.Output(result.toStringWithHead());
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
