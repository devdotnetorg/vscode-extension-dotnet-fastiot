import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../../Shared/IotResult';
import { IotDevice } from '../IotDevice';
import {IContexUI} from '../../ui/IContexUI';

export async function detectGpiochips(treeData: TreeDataDevicesProvider,item:IotDevice,contextUI:IContexUI): Promise<void> {
    contextUI.Output("Action: detecting all GPIO chips");
    //contextUI.ShowBackgroundNotification("Detecting all GPIO chips");              
    const result=await treeData.DetectGpiochips(<string>item.IdDevice);
    //contextUI.HideBackgroundNotification();
    //Output 
    contextUI.Output(result.toStringWithHead());
    //Message
    if(result.Status==StatusResult.Ok) {
        item.GpioChips.collapsibleState=vscode.TreeItemCollapsibleState.Expanded;
        treeData.Refresh(); 
        vscode.window.showInformationMessage(`All GPIO chips found successfully.`);       
    } else {  
        vscode.window.showErrorMessage(`Error. Error while searching for GPIO chips. Device ${item.label} ${item.description}.`);            
    }     
}
