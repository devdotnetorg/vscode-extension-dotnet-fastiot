import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { IotResult,StatusResult } from '../IotResult';
import { TreeDataLaunchsProvider } from '../TreeDataLaunchsProvider';
import { IotTemplateCollection } from '../Templates/IotTemplateCollection';

export async function reloadTemplates(templates:IotTemplateCollection): Promise<void> {        
    templates.LoadTemplatesAsync(true);
}
