import * as vscode from 'vscode';
//import * as fs from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import {IotConfiguration} from '../IotConfiguration';
import {IotDevice} from '../IotDevice';

export function  Sleep (time:number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function GetConfiguration(context: vscode.ExtensionContext,logCallback:(value:string) =>void,versionExt:string):IotConfiguration {    
	let applicationDataPath: string=<string>vscode.workspace.getConfiguration().get('fastiot.device.applicationdatafolder');
	//Application folder definition
	if(applicationDataPath == null||applicationDataPath == undefined||applicationDataPath == "") 
	{
		/* Get home directory of the user in Node.js */
		// check the available memory
		const userHomeDir = os.homedir();
		applicationDataPath=userHomeDir+"\\fastiot";
		//Saving settings
		vscode.workspace.getConfiguration().update('fastiot.device.applicationdatafolder',applicationDataPath,true);
	}
	let config = new IotConfiguration(applicationDataPath,context,logCallback,versionExt);
	config.UsernameAccountDevice= <string>vscode.workspace.getConfiguration().get('fastiot.device.account.username');	
	config.GroupsAccountDevice= <string>vscode.workspace.getConfiguration().get('fastiot.device.account.groups');
	config.TemplateTitleLaunch= <string>vscode.workspace.getConfiguration().get('fastiot.launch.templatetitle');
	//Migrating key files from a previous version of the extension
	const PreviousKeysFolder:string= <string>vscode.workspace.getConfiguration().get('fastiot.device.pathfolderkeys');
	if(PreviousKeysFolder != "")
	{
		const srcDir = PreviousKeysFolder;
		const destDir = config.Folder.DeviceKeys;
		// To copy a folder or file, select overwrite accordingly
		try {
			fs.copyFileSync(srcDir, destDir);
			} catch (err) {
			console.error(err)
		}
		//Saving settings
		vscode.workspace.getConfiguration().update('fastiot.device.pathfolderkeys',"",true);
		vscode.window.showWarningMessage(`Keys for devices from folder ${srcDir} have been moved to folder ${destDir}`);
	}
	//Clear
	config.Folder.ClearTmp();
	//Templates
	let url:string="";
	if(context.extensionMode==vscode.ExtensionMode.Production)
	{
		url="https://raw.githubusercontent.com/devdotnetorg/vscode-extension-dotnet-fastiot/master/templates/system/templatelist.fastiot.yaml";
	}else{
		url="https://raw.githubusercontent.com/devdotnetorg/vscode-extension-dotnet-fastiot/dev-mono/templates/system/templatelist.fastiot.yaml";
	}
	//for test
	url="https://raw.githubusercontent.com/devdotnetorg/vscode-extension-dotnet-fastiot/dev-mono/templates/system/templatelist.fastiot.yaml";
	//
	const LoadTemplates = async () => {
		await config.Templates.LoadTemplatesSystem();
		await config.Templates.UpdateSystemTemplate(url,config.Folder.Temp);
		await config.Templates.LoadTemplatesUser();
	  };
	LoadTemplates();
	//
	return config	
}

export function MakeDirSync(dir: string) {
	if (fs.existsSync(dir)) return;
	if (!fs.existsSync(path.dirname(dir))) {
		MakeDirSync(path.dirname(dir));
	}
	fs.mkdirSync(dir);
}

export function GetWorkspaceFolder(): string| undefined {
	let folder = vscode.workspace.workspaceFolders;
	if (folder != undefined) return folder[0].uri.fsPath;
	return undefined;  	
  }

  export function ReverseSeparatorReplacement(data:string): string {
	let regex = /\\/g;
	const result = data.replace(regex, "\\\\");  	
	return result;	
  }

  export function ReverseSeparatorWinToLinux(data:string): string {
	let regex = /\\/g;
	const result = data.replace(regex, "/");  	
	return result;	
  }

  export function GetUniqueLabel(newLabel:string,suffix:string, increment:number|undefined,arrayName: Array<string>):string{
    let checklabel=newLabel;
    if(increment) checklabel=`${newLabel} ${suffix}${increment}`;    
    const item = arrayName.find(x=>x==checklabel);
    if(item)
    {
      if(!increment) increment=0; 
      increment++;      
      checklabel=GetUniqueLabel(newLabel,suffix,increment,arrayName);
    }
    return checklabel;   
  }

  export function StringTrim(data:string): string {
	let regex = /\r?\n|\r/g;
	let result = data.replace(regex, " ");
	result=result.trimLeft();
	result=result.trimRight();
	return result;	
  }

  // TODO: Move to project class dotNET
  export function GetDotnetRID(osName:string,architecture:string): string {
	//Platform
    //NET RID Catalog
    //https://docs.microsoft.com/en-us/dotnet/core/rid-catalog	
	let result:string;
	//	
    if(osName=="Alpine")
    {
		result="linux-musl-x64";
    }else
    {      
      switch(architecture) { 
        case "x86_64": { 
			result="linux-x64";
           	break; 
        } 
        case "armv7l": { 
			result="linux-arm";
			break; 
        }
        case "aarch64": {
			result="linux-arm64";
			break; 
        } 
        default: {
			//statements;
			result="linux-arm";
			break; 
        } 
     }      
    }
	//
	return result;
  }

  // TODO: Move to template class
  export function MergeWithDictionary(dictionary:Map<string,string>,data:string):string{
    let result:string=data;
    dictionary.forEach((value,key) => {      
      const re = new RegExp(key, 'g');
      result=result.replace(re,value);      
    });
    return result;
  }

  // TODO: Move to template class
  export function DeleteComments(data:string):string{
	  //removes comments like '//'
	  const matchHashComment = new RegExp(/(\/\/.*)/, 'gi');
	  const resultJson = data.replace(matchHashComment, '').trim();
	  return resultJson;
  }

  export enum EntityType {
	//listed in order of priority of use
	system = "system",
	user  = "user",
	community = "community",
	none = "none"
  }
