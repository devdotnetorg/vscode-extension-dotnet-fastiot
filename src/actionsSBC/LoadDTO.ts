import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { AppDomain } from '../AppDomain';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { SbcTreeItemNode } from '../SbcView/SbcTreeItemNode';
import { SbcNode } from '../SbcView/SbcNode';
import { TreeDataSbcProvider } from '../SbcView/TreeDataSbcProvider';
import { IoTHelper } from '../Helper/IoTHelper';

export async function loadDTO(treeData: TreeDataSbcProvider, treeView: vscode.TreeView<SbcTreeItemNode>, item:SbcTreeItemNode): Promise<void> {
    const app = AppDomain.getInstance().CurrentApp;
    const node = item as SbcTreeItemNode;
	const sbc = app.SBCs.FindById(node.IdSbc??"None");
	if(!sbc) return;
    //Main process
    const labelTask="retrieving all DTOs";
    app.UI.Output(`Action: ${labelTask}`);
    const guidBadge=app.UI.BadgeAddItem(labelTask);
    //progress
    let result:IotResult| undefined = await vscode.window.withProgress({
        location: vscode.ProgressLocation.Window,
        title: IoTHelper.FirstLetter(labelTask),
        cancellable: true
    }, (progress, token) => {
        token.onCancellationRequested(() => {
            vscode.window.showWarningMessage(`${IoTHelper.FirstLetter(labelTask)}: cancel operation requested. Wait for the operation to stop.`);
        });
        return new Promise(async (resolve, reject) => {
            const resultLoad = await sbc.DTOs.Load(token);
            resolve(resultLoad);
            return;       
            //end
        });
    });
    if(guidBadge) app.UI.BadgeDeleteItem(guidBadge);
    if(!result) return;
    //Output
    app.UI.Output(result);
    if(result.Status==StatusResult.Ok) {
        //save
        app.SBCs.Save();
        //Set focus
        const sbcNode = treeData.FindById(sbc.Id);
        if (sbcNode) {
            //sbcNode.DTOs.collapsibleState=vscode.TreeItemCollapsibleState.Expanded;
            treeView.reveal(sbcNode.DTOs, {focus: true});
            //treeData.Refresh();
        }
    }else {
        //Message
        app.UI.ShowNotification(result);
    }
}
