import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';

import { IotResult,StatusResult } from '../Shared/IotResult';
import { IoTApplication } from '../IoTApplication';
import { loadTemplates } from '../actionsTemplate/loadTemplates';

export async function importTemplate(app:IoTApplication): Promise<void> {
    //select file
    //canSelectFiles: true,
    //canSelectFolders: false,
    const options: vscode.OpenDialogOptions = {
        defaultUri: vscode.Uri.file(`dotnet-console.zip`),
        canSelectMany: false,        
        openLabel: 'Open',
        filters: {
           'ZIP files': ['zip'],
           'All files': ['*']
       }
    };    
    const file = await vscode.window.showOpenDialog(options);
    if(!file) return;
    //copy to tmp folder
    let fileZipPath = file[0].fsPath;
    let destPath=path.join(app.Config.Folder.Temp, path.parse(fileZipPath).base);
    //clear
    if (fs.existsSync(destPath)) fs.removeSync(destPath);
    fs.copyFileSync(fileZipPath,destPath);
    fileZipPath=destPath;
    //load templates
    if(app.Templates.Count==0)
        await loadTemplates(app);
    //import
    const labelTask="Import template";
    //Main process
    const guidBadge=app.UI.BadgeAddItem(labelTask);
    app.UI.Output(`Action: import template ${fileZipPath}.`);
    const result:IotResult = await vscode.window.withProgress({
        location: vscode.ProgressLocation.Window,
        title: labelTask,
        cancellable: false
    }, (progress, token) => {
        //token.onCancellationRequested(() => {
        //console.log("User canceled the long running operation");
        //});
        return new Promise(async (resolve, reject) => {
            const result=await app.Templates.ImportTemplateUserFromZip(fileZipPath);
            if (fs.existsSync(fileZipPath)) fs.removeSync(fileZipPath);
            resolve(result);
            //end
        });
    });
    if(guidBadge) app.UI.BadgeDeleteItem(guidBadge);
    //Output       
    app.UI.Output(result.toStringWithHead());
    if(result.Status==StatusResult.Ok)
        app.UI.Output(`📚 ${app.Templates.Count} template(s) available.`);
    //Message
    app.UI.ShowNotification(result);
}
