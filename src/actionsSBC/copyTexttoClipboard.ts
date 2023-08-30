import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { BaseTreeItemNode } from '../shared/BaseTreeItemNode';

export async function copyTexttoClipboard(item:BaseTreeItemNode): Promise<void> {                  
        let text="";
        if (item.description==item.tooltip) {
            text=`${item.label}: ${item.description}`;
        } else text=`${item.label}: ${item.tooltip}`;
        vscode.env.clipboard.writeText(text);
}
