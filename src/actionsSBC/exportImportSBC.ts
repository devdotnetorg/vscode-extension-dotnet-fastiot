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
import { SbcType } from '../Types/SbcType';

export async function exportSBC(): Promise<void> {
    const options: vscode.SaveDialogOptions = {
        defaultUri: vscode.Uri.file(`FastIoT-sbcs.json`),
        saveLabel: 'Save Content To ...',
        filters: {
           'JSON files': ['json'],
           'All files': ['*']
       }
    };
    const file = await vscode.window.showSaveDialog(options);
    if(!file) return;
    let result:IotResult;
    const app = AppDomain.getInstance().CurrentApp;
    //Main process
    const labelTask=`export SBCs to file ${file.fsPath}`;
    app.UI.Output(`Action: ${labelTask}`);
    const guidBadge=app.UI.BadgeAddItem(labelTask); 
    try {
        const jsonObj = app.SBCs.ToJSON();
        //save in file
        const strJSON=JSON.stringify(jsonObj);
        fs.writeFileSync(file.fsPath, strJSON,undefined);
        result = new IotResult(StatusResult.Ok,"SBC list exported successfully");
    }catch (err:any) {
        result = new IotResult(StatusResult.Error,"SBC list export error", err);
    }
    if(guidBadge) app.UI.BadgeDeleteItem(guidBadge);
    //Output
    app.UI.Output(result);
    if(result.Status!=StatusResult.Ok)
        //Message
        app.UI.ShowNotification(result);
}

export async function importSBC(): Promise<void> {
    //canSelectFiles: true,
    //canSelectFolders: false,
    const options: vscode.OpenDialogOptions = {
        defaultUri: vscode.Uri.file(`FastIoT-sbcs.json`),
        canSelectMany: false,        
        openLabel: 'Open',
        filters: {
           'JSON files': ['json'],
           'All files': ['*']
       }
    };    
    const file = await vscode.window.showOpenDialog(options);
    if(!file) return;
    let result:IotResult;
    const app = AppDomain.getInstance().CurrentApp;
    //Main process
    const labelTask=`import SBCs from file ${file[0].fsPath}`;
    app.UI.Output(`Action: ${labelTask}`);
    const guidBadge=app.UI.BadgeAddItem(labelTask); 
    try {
        const jsonObj = JSON.parse(fs.readFileSync(file[0].fsPath, 'utf-8'));
        result = app.SBCs.ImportFromJSON(jsonObj);
    }catch (err:any) {
        result = new IotResult(StatusResult.Error,err);
    }
    //Output
    if(guidBadge) app.UI.BadgeDeleteItem(guidBadge);
    app.UI.Output(result);
    if(result.Status==StatusResult.Ok) {
        //save
        app.SBCs.Save();
    }else {
        //Message
        app.UI.ShowNotification(result);
    }
    
}
