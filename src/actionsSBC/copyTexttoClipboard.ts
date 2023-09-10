import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { BaseTreeItemNode } from '../shared/BaseTreeItemNode';
import { string } from 'yaml/dist/schema/common/string';

export async function copyTexttoClipboard(item:BaseTreeItemNode): Promise<void> {                  
        let text="None";
        //tooltip as string
        if (typeof item.tooltip === 'string') {
            if (item.description==item.tooltip) {
                text=`${item.label}: ${item.description}`;
            } else text=`${item.label}: ${item.tooltip}`;
        }
        //tooltip as Markdown
        if(item.tooltip instanceof vscode.MarkdownString) {
            text=item.tooltip.value;
        }
        vscode.env.clipboard.writeText(text);
}
