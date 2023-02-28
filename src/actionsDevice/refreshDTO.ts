import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotDevice } from '../IotDevice';
import {IoTUI} from '../ui/IoTUI';

export async function refreshDTO(treeData: TreeDataDevicesProvider,item:IotDevice,contextUI:IoTUI): Promise<void> {   
    contextUI.Output("Action: retrieving all DTOs");
    contextUI.StatusBarBackground.showAnimation("Retrieving all DTOs");              
    const result=await treeData.GetAllDTO(<string>item.IdDevice);
    contextUI.StatusBarBackground.hide();
    //Output 
    contextUI.Output(result.toMultiLineString("head"));
    //Message
    if(result.Status==StatusResult.Ok) {
        item.DtoLinux.collapsibleState=vscode.TreeItemCollapsibleState.Expanded;
        treeData.Refresh(); 
        vscode.window.showInformationMessage(`All DTOs have been successfully received.`);       
    } else {        
        vscode.window.showErrorMessage(`Error. Error getting DTOs. ${result.Message}.`);            
    }
}
