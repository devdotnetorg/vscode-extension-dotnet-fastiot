import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { IotResult,StatusResult } from '../Shared/IotResult';
import { IoTHelper } from '../Helper/IoTHelper';
import { ItemQuickPick } from '../Helper/actionHelper';
import { AppDomain } from '../AppDomain';
import { SbcTreeItemNode } from '../SbcView/SbcTreeItemNode';
import { SbcNode } from '../SbcView/SbcNode';
import { ISbcAccount } from '../Sbc/ISbcAccount';

export async function rebootSBC(item:SbcTreeItemNode, firstText?:string): Promise<void> { 
    let textMessage:string;
    if(firstText) {
        textMessage=`${firstText}. Reboot your SBC: 
        ${item.label} ${item.description}?`;
    } else {
        textMessage=`Do you really want to reboot the SBC: 
        ${item.label} ${item.description}?`;
    }
    //show
    const answer = await vscode.window.showInformationMessage(textMessage, ...["Yes", "No"]);
    if(answer!="Yes") return;
    //reboot
    const app = AppDomain.getInstance().CurrentApp;
    const sbcNode = item as SbcNode;
    const sbc = app.SBCs.FindById(sbcNode.IdSbc??"None");
    if(!sbc) return;
    const labelTask="reboot SBC";
    app.UI.Output(`Action: ${labelTask}`);
    //reboot
    const guidBadge=app.UI.BadgeAddItem(labelTask);
    //progress
    const result:IotResult| undefined = await vscode.window.withProgress({
        location: vscode.ProgressLocation.Window,
        title: IoTHelper.FirstLetter(labelTask),
        cancellable: true
    }, (progress, token) => {
        token.onCancellationRequested(() => {
            vscode.window.showWarningMessage(`${IoTHelper.FirstLetter(labelTask)}: cancel operation requested. Wait for the operation to stop.`);
        });
        return new Promise(async (resolve, reject) => {
            const resultReboot = await sbc.Reboot(token);
            resolve(resultReboot);
        });
    });
    if(!result) return;
    if(guidBadge) app.UI.BadgeDeleteItem(guidBadge);
    //Output
    app.UI.Output(result.toStringWithHead());
    //Message
    if(result.Status==StatusResult.Ok) {
        vscode.window.showInformationMessage(`Reboot completed successfully. 
        SBC: ${item.label} ${item.description}`);
    } else {
        vscode.window.showErrorMessage(`Error. Failed to reboot SBC! ${result.Message}`);
    }

}
