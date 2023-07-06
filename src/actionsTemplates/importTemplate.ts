import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { IotResult,StatusResult } from '../IotResult';
import { IoTApplication } from '../IoTApplication';

export async function ImportTemplate(app:IoTApplication): Promise<void> {
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
    let result:IotResult;
    //копирование в папку tmp

    //распаковка zip

    const guidBadge=app.UI.BadgeAddItem("Loading templates");
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Loading ... ",
        cancellable: false
    }, (progress, token) => {
        //token.onCancellationRequested(() => {
        //console.log("User canceled the long running operation");
        //});
        return new Promise(async (resolve, reject) => {
            //event subscription
            let handler=app.Templates.OnChangedStateSubscribe(event => {              
                if(event.increment&&typeof event.message === 'string'){
                    progress.report({ message: event.message,increment: event.increment });
                }else {
                    //output
                    if(event.message) {
                        if(event.logLevel) app.UI.Output(event.message,event.logLevel);
                            else app.UI.Output(event.message);
                    }
                }
            });
            //run
            //await app.Templates.LoadEntitiesAll(force);
            //event unsubscription    
            app.Templates.OnChangedStateUnsubscribe(handler);
            resolve(undefined);
            //end
        });
    });
    if(guidBadge) app.UI.BadgeDeleteItem(guidBadge);
}
