import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IoTHelper } from '../Helper/IoTHelper';
import { ItemQuickPick } from '../Helper/actionHelper';
import { AppDomain } from '../AppDomain';
import { SbcTreeItemNode } from '../SbcView/SbcTreeItemNode';
import { SbcNode } from '../SbcView/SbcNode';
import { ISbcAccount } from '../Sbc/ISbcAccount';
import { IotResult,StatusResult } from '../Shared/IotResult';
import { dotnetHelper } from '../Helper/dotnetHelper';
import { LocalCLI } from '../Shared/LocalCLI';

export async function checkRequirements(): Promise<void> {
    const app = AppDomain.getInstance().CurrentApp;
    try {
        //components
        //net6.0 or net7.0
        let dotnetInstalled = dotnetHelper.ExistsDotNetRuntime("6.0");
        //dotnet-script need net6.0 or net7.0
        let dotnetScriptInstalled = false;
        if (dotnetInstalled)
            dotnetScriptInstalled = dotnetHelper.ExistsToolDotnetScript();
        if(dotnetInstalled&&dotnetScriptInstalled)
            //is OK
            return Promise.resolve(undefined);
        //out
        let msg = `Checking system requirements:\n`+
            `${(dotnetInstalled?"🟢":"🔴 not installed")} 'dotnet 6.0'\n`+
            `${(dotnetScriptInstalled?"🟢":"🔴 not installed")} 'dotnet script'`;
        app.UI.Output(msg);
        //Main process
        const labelTask="Installing components ...";
        app.UI.Output(labelTask);
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
                let localCLI = new LocalCLI();
                //event subscription
                let handler=localCLI.OnChangedStateSubscribe(event => {
                    //Progress
                    if(event.status)
                        progress.report({ message: event.status });
                    //output
                    if(event.message) {
                        if(event.logLevel) app.UI.Output(event.message,event.logLevel);
                            else app.UI.Output(event.message);
                    }
                });
                //install
                //dotnet6.0
                //https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-install-script
                app.UI.Output("Installing/updating dotnet6.0:");
                app.UI.Output("Wait for the operation to complete!");
                let command = `powershell.exe -NoProfile -ExecutionPolicy unrestricted -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; &([scriptblock]::Create((Invoke-WebRequest -UseBasicParsing 'https://dot.net/v1/dotnet-install.ps1'))) -Runtime dotnet -Channel 6.0"`;
                let result = await localCLI.Run(command,token);
                //dotnet-script
                //https://github.com/dotnet-script/dotnet-script
                //local
                app.UI.Output("Installing/updating dotnet-script:");
                app.UI.Output("Wait for the operation to complete!");
                const location = dotnetHelper.GetPathDotNetOfLocalUser();
                result= new IotResult(StatusResult.Error);
                if(location) {
                    command = `${location} tool install -g dotnet-script`;
                    result = await localCLI.Run(command,token);
                }
                //global
                if(result.Status!=StatusResult.Ok) {
                    command = `dotnet tool install -g dotnet-script`;
                    result = await localCLI.Run(command,token);
                }
                //result
                localCLI.OnChangedStateUnsubscribe(handler);
                resolve(result);
                return;       
                //end
            });
        });
        if(guidBadge) app.UI.BadgeDeleteItem(guidBadge);
        if(!result) return Promise.resolve(undefined);
        //Output
        if(result.Status!=StatusResult.Ok) {
            msg="Failed to install required components. Use the installation instructions: \n" +
            "http://asd";
            app.UI.Output(msg);
        }
        //report
        dotnetInstalled = dotnetHelper.ExistsDotNetRuntime("6.0");
        //dotnet-script need net6.0 or net7.0
        dotnetScriptInstalled = false;
        if (dotnetInstalled)
            dotnetScriptInstalled = dotnetHelper.ExistsToolDotnetScript();
        //out
        msg = `Checking system requirements:\n`+
            `${(dotnetInstalled?"🟢":"🔴 not installed")} 'dotnet 6.0'\n`+
            `${(dotnetScriptInstalled?"🟢":"🔴 not installed")} 'dotnet script'`;
        app.UI.Output(msg);
    } catch (err: any){
        const result= new IotResult(StatusResult.Error,`Error checkRequirements'`,err);
        app.UI.Output(result);
        app.UI.ShowNotification(result);
    }
}
