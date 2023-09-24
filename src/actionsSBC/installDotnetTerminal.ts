import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IoTHelper } from '../Helper/IoTHelper';
import { ItemQuickPick } from '../Helper/actionHelper';
import { AppDomain } from '../AppDomain';
import { SbcTreeItemNode } from '../SbcView/SbcTreeItemNode';
import { SbcNode } from '../SbcView/SbcNode';
import { ISbcAccount } from '../Sbc/ISbcAccount';


export async function installDotnetTerminal(channelDotNet:string): Promise<void> {
        //run
        const runtimeDotnet = "dotnet";
        const runCmd=`&powershell -NoProfile -ExecutionPolicy unrestricted -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; &([scriptblock]::Create((Invoke-WebRequest -UseBasicParsing 'https://dot.net/v1/dotnet-install.ps1'))) -Runtime ${runtimeDotnet} -Channel ${channelDotNet}"`;
        const terminal = vscode.window.createTerminal({ name: `Install dotnet ${channelDotNet}` });
	terminal.show();
        terminal.sendText(runCmd, true);
}
