import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IoTHelper } from '../Helper/IoTHelper';
import { ItemQuickPick } from '../Helper/actionHelper';
import { AppDomain } from '../AppDomain';
import { SbcTreeItemNode } from '../SbcView/SbcTreeItemNode';
import { SbcNode } from '../SbcView/SbcNode';
import { ISbcAccount } from '../Sbc/ISbcAccount';


export async function openSshTerminal(item:SbcTreeItemNode): Promise<void> {
        //select account
        const app = AppDomain.getInstance().CurrentApp;
        const sbcNode = item as SbcNode;
        const sbc = app.SBCs.FindById(sbcNode.IdSbc??"None");
        if(!sbc) return;
        //Choice options
        let itemAccounts:Array<ItemQuickPick>=[];
        sbc.Accounts.forEach((account) => {
                const label=IoTHelper.FirstLetter(account.Assignment);
                const detail=`Login: ${account.UserName}, key: ${account.SshKeyFileName}`;
                const value=account;
                const itemAccount = new ItemQuickPick(label,"",value,detail);
                itemAccounts.push(itemAccount);
        });
        //show
        let SELECTED_ITEM = await vscode.window.showQuickPick(itemAccounts,{title: 'Select an account to connect'});
        if(!SELECTED_ITEM) return;
        const account = SELECTED_ITEM.value as ISbcAccount;
        //run
        const runCmd=`${path.join(app.Config.Folder.AppsBuiltIn, "cwrsync", "ssh.exe")} `+
                `-i ${account.GetSshKeyPath()} `+
                `-o 'StrictHostKeyChecking no' -o 'UserKnownHostsFile /dev/null' `+
                `-p ${account.Port} `+
                `${account.UserName}@${account.Host}`;
        const terminal = vscode.window.createTerminal({ name: `SSH-terminal ${item.label}` });
	terminal.show();
        terminal.sendText(`echo "Use the 'exit' command to EXIT"`, true);
        terminal.sendText(runCmd, true);
}
