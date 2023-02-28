import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotDevice } from '../IotDevice';
import { IoTHelper } from '../Helper/IoTHelper';
import {IoTUI} from '../ui/IoTUI';

export async function connectionTestDevice(treeData: TreeDataDevicesProvider,item:IotDevice,contextUI:IoTUI): Promise<void> {   
    const device= treeData.FindbyIdDevice(<string>item.IdDevice);
    if(device) {
        contextUI.Output("Action: connection test device");
        contextUI.StatusBarBackground.showAnimation("hecking the network connection");
        const result = await device.ConnectionTest();
        contextUI.StatusBarBackground.hide();
        //Output
        contextUI.Output(result.toMultiLineString("head"));
        //Message          
        if(result.Status==StatusResult.Ok) {
            vscode.window.showInformationMessage(`Connection to host ${device.Account.Host} via ssh 
            with ${device.Account.Identity} key completed successfully.`);
        } else {         
            vscode.window.showErrorMessage(`Unable to connect to host ${device.Account.Host} via ssh 
            with ${device.Account.Identity} key.`);            
        }
    } else {
        vscode.window.showErrorMessage(`Device ${item.IdDevice} not found`);
    }
}
