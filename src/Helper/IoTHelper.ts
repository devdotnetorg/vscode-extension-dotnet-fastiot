import * as vscode from 'vscode';
//import * as fs from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import {v4 as uuidv4} from 'uuid';

import {IotDevice} from '../IotDevice';

export class IoTHelper {

  static Sleep (time:number) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  static MakeDirSync(dir: string) {
    if (fs.existsSync(dir)) return;
    if (!fs.existsSync(path.dirname(dir))) {
      IoTHelper.MakeDirSync(path.dirname(dir));
    }
    fs.mkdirSync(dir);
  }

  static GetWorkspaceFolder(): string| undefined {
    let folder = vscode.workspace.workspaceFolders;
    if (folder != undefined) return folder[0].uri.fsPath;
    return undefined;  	
  }

  static ReverseSeparatorReplacement(data:string): string {
    let regex = /\\/g;
    const result = data.replace(regex, "\\\\");  	
    return result;	
  }

  static ReverseSeparatorWinToLinux(data:string): string {
    let regex = /\\/g;
    const result = data.replace(regex, "/");  	
    return result;	
  }

  static ReverseSeparatorLinuxToWin(data:string): string {
    let regex = /\//g;
    const result = data.replace(regex, "\\");  	
    return result;	
  }

  static StringTrim(data:string): string {
    let regex = /\r?\n|\r/g;
    let result = data.replace(regex, " ");
    result=result.trimLeft();
    result=result.trimRight();
    return result;	
  }

  // TODO: Move to template class
  static MergeWithDictionary(dictionary:Map<string,string>,data:string):string{
    let result:string=data;
    dictionary.forEach((value,key) => {      
      const re = new RegExp(key, 'g');
      result=result.replace(re,value);      
    });
    return result;
  }

  static DeleteComments(data:string):string{
    //removes comments like '//'
    const matchHashComment = new RegExp(/(\/\/.*)/, 'gi');
    const resultJson = data.replace(matchHashComment, '').trim();
    return resultJson;
  }

  static ConvertToValidFilename(value:string,replacement:string) {
    return (value.replace(/[\/|\\:*?"<>]/g, replacement));
  }

  static GetFileExtensions(value:string):string {
    //dotnetapp.csproj => .csproj
    let extmainFileProj:string="";
    const re = /(?:\.([^.]+))?$/;
    const ext = re.exec(value);
    if(ext?.length==2) extmainFileProj=ext[0];
    return extmainFileProj;
  }

  static GetAllFilesByExt(dir:string,fileExtension:string):Array<string> {
    //search for files in depth on three levels
    const depthLevel=4;
    const helper= new IoTHelper();
    const files = helper.GetAllFilesByExtRecurc(dir,fileExtension, depthLevel);    
    return files;
  }

  private GetAllFilesByExtRecurc(pathFolder:string, fileExtension:string, depthLevel=1,currenDepthLevel=1): Array<string> {
    let result:Array<string>=[];
    if(currenDepthLevel>depthLevel) return result;
    //    
    let files=fs.readdirSync(pathFolder);
    files.forEach((name) => {
      const filename=`${pathFolder}\\${name}`;      
      if(fs.lstatSync(filename).isDirectory())
        {          
          //if(!currenDepthLevel) currenDepthLevel=0;
          //currenDepthLevel++
          const helper= new IoTHelper();
          const result2=helper.GetAllFilesByExtRecurc(filename, fileExtension, depthLevel,currenDepthLevel+1);
          result2.forEach((element) => {
            result.push(element);
          });          
        } 
      if(fs.lstatSync(filename).isFile())
        {
          if(`.${filename.split('.').pop()}`==fileExtension)
          {
            console.log(filename);
            result.push(filename);
          }          
        }       
    });
    //
    return result;     
  }

  static CreateGuid():string
  {
    const guid = uuidv4();
    return guid.substr(0,8);
  }
  
}
 

 

 
 
 