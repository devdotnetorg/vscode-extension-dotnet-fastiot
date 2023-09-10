import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { IotResult,StatusResult } from '../Shared/IotResult';
import { IoTHelper } from '../Helper/IoTHelper';
import { ISbcAccount } from '../Sbc/ISbcAccount';
import { AppDomain } from '../AppDomain';

export async function connectionTestSBC(accounts:ISbcAccount[]): Promise<void> {
    const app = AppDomain.getInstance().CurrentApp;
    //Main process
    const labelTask="connection test SBC";
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
            let index=0;
            do {
                let account=accounts[index];
                if(account) {
                   //Checking the network connection
                progress.report({ message: `checking the network connection '${account.UserName}'` });
                let resultConTest = await account.ConnectionTest(true);
                app.UI.Output(resultConTest);
                //Message          
                if(resultConTest.Status==StatusResult.Ok) {
                    vscode.window.showInformationMessage(`Connection to host ${account.Host} via ssh 
                    with 🔑 ${account.SshKeyFileName} key completed successfully.`);
                } else {         
                    vscode.window.showErrorMessage(`Unable to connect to host ${account.Host}} via ssh 
                    with 🔑 ${account.SshKeyFileName} key.`);            
                }
                //next position
                index=index+1;
                if(token.isCancellationRequested) break;
                }else break;
            } while(true)
            resolve(undefined);
            return;
            //end
        });
    });
    if(guidBadge) app.UI.BadgeDeleteItem(guidBadge);
}
