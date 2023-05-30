import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { IotItemTree } from '../shared/IotItemTree';

export async function copyTexttoClipboard(item:IotItemTree): Promise<void> {                    
        let text="";
        if (item.description==item.tooltip){
            text=`${item.label}: ${item.description}`;
        } else
        {
            text=`${item.label}: ${item.tooltip}`;
        }
        vscode.env.clipboard.writeText(text);
}
