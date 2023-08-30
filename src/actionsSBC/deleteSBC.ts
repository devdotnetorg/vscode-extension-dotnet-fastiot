import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { AppDomain } from '../AppDomain';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { SbcTreeItemNode } from '../SbcView/SbcTreeItemNode';
import { SbcNode } from '../SbcView/SbcNode';

export async function deleteSBC(item:SbcTreeItemNode): Promise<void> {
    const answer = await vscode.window.showInformationMessage(`Do you really want to remove the SBC:
        ${item.label} ${item.description}?`, ...["Yes", "No"]);
    if(answer=="Yes") {
        const app = AppDomain.getInstance().CurrentApp;
        const sbcNode = item as SbcNode;
		const sbc = app.SBCs.FindById(sbcNode.IdSbc??"None");
		if(!sbc) return;
        app.UI.Output(`Action: remove device ${sbc.Label} ${sbc.Id}`);
        let result:IotResult;
        result=app.SBCs.Remove(sbc.Id);
        //Output 
        app.UI.Output(result.toStringWithHead());
        if(result.Status==StatusResult.Ok)
            //save
            app.SBCs.Save();      
    }
}
