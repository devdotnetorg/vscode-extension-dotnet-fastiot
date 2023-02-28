import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../IotResult';
import { IotDeviceDTO } from '../IotDeviceDTO';
import { rebootDevice } from './rebootDevice';
import {IoTUI} from '../ui/IoTUI';

export async function disableDTO(treeData: TreeDataDevicesProvider,item:IotDeviceDTO,contextUI:IoTUI): Promise<void> {
    contextUI.Output("Action: disabling DTO");
    contextUI.StatusBarBackground.showAnimation("Disabling DTO");               
    const result=await treeData.DisableDTO(item);
    contextUI.StatusBarBackground.hide();
    //Output 
    contextUI.Output(result.toMultiLineString("head"));
    //Message
    if(result.Status==StatusResult.Ok) {        
        treeData.Refresh(); 
        vscode.window.showInformationMessage(`DTO disabled successfully.`);
        //reboot
        rebootDevice(treeData,item.Device,"You need to reboot the device to accept the changes",contextUI);
    } else {        
        vscode.window.showErrorMessage(`Error. Error disabling DTO.`);      
    }
}
