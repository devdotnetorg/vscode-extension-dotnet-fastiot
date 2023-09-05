import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataDevicesProvider } from '../TreeDataDevicesProvider';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { SbcTreeItemNode } from '../SbcView/SbcTreeItemNode';
import { IoTHelper } from '../Helper/IoTHelper';
import { AppDomain } from '../AppDomain';

export async function renameSBC(item:SbcTreeItemNode): Promise<void> {
    let result:IotResult;              
    let newLabel = await vscode.window.showInputBox({				
        prompt: 'prompt',
        title: 'Enter a new name SBC',
        value:<string>item.label
    });
    if((newLabel==undefined)||(newLabel==item.label)) return;
    //Rename
    const app = AppDomain.getInstance().CurrentApp;
    const sbc = app.SBCs.FindById(item.IdSbc??"None");
    if (!sbc) return;
    result=sbc.SetLabel(newLabel);
    if(result.Status!=StatusResult.Ok) {
        app.UI.ShowNotification(result);
        return;
    }
    app.SBCs.Save();
}

