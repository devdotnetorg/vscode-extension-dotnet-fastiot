import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotDevice } from '../IotDevice';
import {IoTUI} from '../ui/IoTUI';

export async function detectGpiochips(treeData: TreeDataDevicesProvider,item:IotDevice,contextUI:IoTUI): Promise<void> {
    contextUI.Output("Action: detecting all GPIO chips");
    contextUI.StatusBarBackground.showAnimation("Detecting all GPIO chips");              
    const result=await treeData.DetectGpiochips(<string>item.IdDevice);
    contextUI.StatusBarBackground.hide();
    //Output 
    contextUI.Output(result.toMultiLineString("head"));
    //Message
    if(result.Status==StatusResult.Ok) {
        item.GpioChips.collapsibleState=vscode.TreeItemCollapsibleState.Expanded;
        treeData.Refresh(); 
        vscode.window.showInformationMessage(`All GPIO chips found successfully.`);       
    } else {  
        vscode.window.showErrorMessage(`Error. Error while searching for GPIO chips. Device ${item.label} ${item.description}.`);            
    }     
}
