import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IoTHelper } from '../Helper/IoTHelper';
import { IotDevice } from '../IotDevice';
import { IConfiguration } from '../Configuration/IConfiguration';

export async function openSshTerminal(item:IotDevice,config:IConfiguration): Promise<void> {
        const runCmd=`${config.Folder.AppsBuiltIn}\\cwrsync\\ssh.exe `+
                `-i ${item.Account.PathKey} `+
                `-o 'StrictHostKeyChecking no' -o 'UserKnownHostsFile /dev/null' `+
                `-p ${item.Account.Port} `+
                `${item.Account.UserName}@${item.Account.Host}`;
        const terminal = vscode.window.createTerminal({ name: `SSH-terminal ${item.label}` });
	terminal.show();
        terminal.sendText(`echo "Use the 'exit' command to EXIT"`, true);
        terminal.sendText(runCmd, true);
}
