import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { TreeDataSbcProvider } from '../SbcView/TreeDataSbcProvider';
import { IotResult,StatusResult } from '../Shared/IotResult';

export async function refreshSBC(treeData: TreeDataSbcProvider): Promise<void> {        
    treeData.Refresh();
    vscode.window.showInformationMessage("Refresh SBCs");
}
