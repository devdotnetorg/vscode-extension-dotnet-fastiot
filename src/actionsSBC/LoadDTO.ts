import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { AppDomain } from '../AppDomain';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { SbcTreeItemNode } from '../SbcView/SbcTreeItemNode';
import { SbcNode } from '../SbcView/SbcNode';


export async function LoadDTO(item:SbcTreeItemNode): Promise<void> {
    const app = AppDomain.getInstance().CurrentApp;
    const node = item as SbcTreeItemNode;
	const sbc = app.SBCs.FindById(node.IdSbc??"None");
	if(!sbc) return;
    app.UI.Output(`Action: retrieving all DTOs`);
    let result:IotResult;
    result = await sbc.DTOs.Load();
    app.UI.Output(result);


    /*
    const result=await treeData.GetAllDTO(<string>item.IdDevice);
    contextUI.HideBackgroundNotification();
    //Output 
    contextUI.Output(result.toStringWithHead());
    //Message
    if(result.Status==StatusResult.Ok) {
        item.DtoLinux.collapsibleState=vscode.TreeItemCollapsibleState.Expanded;
        treeData.Refresh(); 
        vscode.window.showInformationMessage(`All DTOs have been successfully received.`);       
    } else {        
        vscode.window.showErrorMessage(`Error. Error getting DTOs. ${result.Message}.`);            
    }
    */
}
