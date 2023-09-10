import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { IotResult,StatusResult } from '../Shared/IotResult';
//import { refreshDTO } from './refreshDTO';
import { AppDomain } from '../AppDomain';
import { SbcTreeItemNode } from '../SbcView/SbcTreeItemNode';
import { SbcNode } from '../SbcView/SbcNode';
import { TreeDataSbcProvider } from '../SbcView/TreeDataSbcProvider';
import { IoTHelper } from '../Helper/IoTHelper';
import { IoT } from '../Types/Enums';
import ActionUser = IoT.Enums.Action;
import { rebootSBC } from './rebootSBC';

/** Add, remove, enable, disable DTO. */
export async function managementDTO(item:SbcTreeItemNode, actionUser:ActionUser): Promise<void> {
    switch(actionUser) {
        case ActionUser.add: {
            addDTO(item);
            break; 
        } 
        default: {
            removeEnableDisableDTO(item, actionUser);
            break;
        }
     }
}

export async function addDTO(item:SbcTreeItemNode): Promise<void> {
    if(item.Childs.length==0) return;
    //
    const app = AppDomain.getInstance().CurrentApp;
    const node = item as SbcTreeItemNode;
	const sbc = app.SBCs.FindById(node.IdSbc??"None");
	if(!sbc) return;
    //questions
    const options: vscode.OpenDialogOptions = {
        defaultUri: vscode.Uri.file(`overlay.dts`),
        canSelectMany: false,        
        openLabel: 'Open',
        filters: {
           'DTS files': ['dts'],
           'DTBO files': ['dtbo']        
       }
    }; 
    const file = await vscode.window.showOpenDialog(options);
    if(!file) return;
    //Main process
    const labelTask=`adding a DTO file ${file[0].fsPath}`;
    app.UI.Output(`Action: ${labelTask}`);
    const guidBadge=app.UI.BadgeAddItem(labelTask);
    //progress
    //dts or dtbo
    const dtoExt = path.extname(file[0].fsPath); // returns '.dts' or '.dtbo'
    let dataFile:string;
    let fileType:string;
    if(dtoExt=='.dts') {
        dataFile = fs.readFileSync(file[0].fsPath, 'utf-8');
        fileType="utf8";
    }else {
        //'.dtbo'
        dataFile = fs.readFileSync(file[0].fsPath, 'binary'); //binary base64
        fileType="ascii"; //ascii base64
    }
    const fileName = path.parse(file[0].fsPath).base;
    let result:IotResult| undefined = await vscode.window.withProgress({
        location: vscode.ProgressLocation.Window,
        title: IoTHelper.FirstLetter(labelTask),
        cancellable: true
    }, (progress, token) => {
        token.onCancellationRequested(() => {
            vscode.window.showWarningMessage(`${IoTHelper.FirstLetter(labelTask)}: cancel operation requested. Wait for the operation to stop.`);
        });
        return new Promise(async (resolve, reject) => {
            const resultAdd = await sbc.DTOs.Put(fileName,dataFile,fileType,token);
            resolve(resultAdd);
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
    }else {
        //Message
        app.UI.ShowNotification(result);
    }

}

export async function removeEnableDisableDTO(item:SbcTreeItemNode, actionUser:ActionUser): Promise<void> {
    //question
    if (actionUser==ActionUser.remove) {
        const answer = await vscode.window.showInformationMessage(`Do you really want to remove the DTO: 
        ${item.label}?`, ...["Yes", "No"]);
        if(answer!="Yes") return;
    }
    const app = AppDomain.getInstance().CurrentApp;
    const node = item as SbcTreeItemNode;
	const sbc = app.SBCs.FindById(node.IdSbc??"None");
    if(!sbc) return;
    const dto = sbc.DTOs.FindByName(item.label?.toString()??"None");
	if(!dto) return;
    //Main process
    let labelTask="";
    if (actionUser==ActionUser.remove) labelTask=`removal DTO ${dto.name}`;
    if (actionUser==ActionUser.enable) labelTask=`enabling DTO ${dto.name}`;
    if (actionUser==ActionUser.disable) labelTask=`disabling DTO ${dto.name}`;
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
            let resultAction:IotResult|undefined;
            if (actionUser==ActionUser.remove) resultAction = await sbc.DTOs.Delete(dto,token);
            if (actionUser==ActionUser.enable) resultAction = await sbc.DTOs.Enable(dto,token);
            if (actionUser==ActionUser.disable) resultAction = await sbc.DTOs.Disable(dto,token);
            resolve(resultAction);
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
        //reboot
        if (actionUser==ActionUser.enable||actionUser==ActionUser.disable) {
            const sbcNode = item.Parent?.Parent?? new SbcTreeItemNode("None");
            rebootSBC(sbcNode,"You need to reboot the SBC to accept the changes");
        }
    }else {
        //Message
        app.UI.ShowNotification(result);
    }

}
