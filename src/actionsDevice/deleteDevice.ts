import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotDevice } from '../IotDevice';
import {IContexUI} from '../ui/IContexUI';

export async function deleteDevice(treeData: TreeDataDevicesProvider,item:IotDevice,contextUI:IContexUI): Promise<void> {
    const answer = await vscode.window.showInformationMessage(`Do you really want to remove the device:
        ${item.label} ${item.description}?`, ...["Yes", "No"]);
    if(answer=="Yes") {
        contextUI.Output(`Action: remove device ${item.label} ${item.IdDevice}`);
        contextUI.ShowBackgroundNotification("Remove device");
        const result=await treeData.DeleteDevice(<string>item.IdDevice);
        contextUI.HideBackgroundNotification();
        //Output       
        contextUI.Output(result.toMultiLineString("head"));
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
