import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { IotResult,StatusResult } from '../Shared/IotResult';
import { LaunchNode } from '../LaunchView/LaunchNode';
import { TreeDataSbcProvider } from '../SbcView/TreeDataSbcProvider';
import { SbcTreeItemNode } from '../SbcView/SbcTreeItemNode';


export async function gotoSbc(item:LaunchNode, treeData: TreeDataSbcProvider, treeView:vscode.TreeView<SbcTreeItemNode>): Promise<void> {
    const sourceSbc=item.Launch.Sbc;
    if(!sourceSbc) return;
    if(typeof sourceSbc === "string") return;
    //find sbc
    const sbcNode = treeData.FindById(sourceSbc.Id);
    //Set focus
    if (sbcNode) {
        treeView.reveal(sbcNode, {focus: true});
    }else{
        vscode.window.showErrorMessage('SBC not found.');
    } 
}
