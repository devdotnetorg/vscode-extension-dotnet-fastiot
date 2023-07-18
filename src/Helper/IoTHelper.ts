import * as vscode from 'vscode';
//import * as fs from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import * as cp from "child_process";
import { v4 as uuidv4 } from 'uuid';
import { IotResult,StatusResult } from '../IotResult';
import { utimesSync } from 'utimes';

export class IoTHelper {

  static Sleep (time:number=1000) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  static MakeDirSync(dir: string):IotResult {
    try {
      if (fs.existsSync(dir)) return new IotResult(StatusResult.Ok,`Directory ${dir} created successfully`);
      if (!fs.existsSync(path.dirname(dir))) {
        IoTHelper.MakeDirSync(path.dirname(dir));
      }
      fs.mkdirSync(dir);
    } catch (err: any){
      return new IotResult(StatusResult.Error,`Failed to create directory ${dir}`,err);
    }
    return new IotResult(StatusResult.Ok,`Directory ${dir} created successfully`);
  }

  static GetWorkspaceDirectory(): string| undefined {
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

  static StringToArray(data:string,separator:string): string[] {
    let result:string[]=[];
    let array=data.split(separator);
    array.forEach((item) => {
      item=IoTHelper.StringTrim(item);
      if(item != "") result.push(item);
    });
    return result;	
  }

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
    try {
      let files=fs.readdirSync(pathFolder);
      files.forEach((name) => {
        const filename=path.join(pathFolder, name);
        if(fs.lstatSync(filename).isDirectory()) {
          const helper= new IoTHelper();
          const result2=helper.GetAllFilesByExtRecurc(filename, fileExtension, depthLevel,currenDepthLevel+1);
          result2.forEach((element) => {
            result.push(element);
          });          
        }
        if(fs.lstatSync(filename).isFile()) {
          if(`.${filename.split('.').pop()}`==fileExtension) {
            //console.log(filename);
            result.push(filename);
          }          
        }       
      });
    } catch (err: any){}
    return result;
  }

  static CreateGuid():string
  {
    const guid = uuidv4();
    return guid.substr(0,8);
  }

  static UnpackFromZip(fileZipPath:string, unpackDir:string):IotResult {
    let result:IotResult;
    try {
      //no file
      if (!fs.existsSync(fileZipPath)) {
        result = new IotResult(StatusResult.Error,`Unpack file not found ${fileZipPath}`);
        return result;
      }
      //clear
      if (fs.existsSync(unpackDir)) {
        fs.emptyDirSync(unpackDir);
        fs.removeSync(unpackDir);
      }
      //create root dir
      const rootDir = path.dirname(unpackDir);
      IoTHelper.MakeDirSync(rootDir);
      //unpack
      var AdmZip = require("adm-zip");
      var zip = new AdmZip(fileZipPath);
      // extracts everything
      zip.extractAllTo(/*target path*/ unpackDir, /*overwrite*/ true);
      result = new IotResult(StatusResult.Ok, `The archive was successfully unpacked, path ${unpackDir}`);
    } catch (err: any){
      result = new IotResult(StatusResult.Error,`Error while unpacking file ${fileZipPath} to dir ${unpackDir}`,err);
    }
    //result
    return result;
  }

  static GetListDir(dirPath:string):string[]
  {
    let listFolders:Array<string>=[];
    //check path 
    if (!fs.existsSync(dirPath)) return listFolders;
    try {
      //getting a list of entity directories
      const files = fs.readdirSync(dirPath);
      //getting a list of folders
      files.forEach(name => {
        //directory
        const dir=path.join(dirPath, name);
        if(fs.lstatSync(dir).isDirectory()) listFolders.push(dir);
      });
    } catch (err: any){}   
    return listFolders;
  }

  static GetPathAsCygdrive(dirPath:string):string
  {
    //first lowcase
    dirPath=dirPath.substring(0,1).toLowerCase()+dirPath.substring(1);
    //folderPath    
    //const folderPath=path.dirname(dirPath);
    //Rsync
    let objArray=(<string>dirPath).split("\\"); 
    objArray[0]=objArray[0].replace(":","");
    let cyPath="/cygdrive";
    objArray.forEach(element =>{
      cyPath=cyPath+`/${element}`;
    });
    return cyPath;
  }

  static GetAllFile(dirPath:string):string[]
  {
    let listFiles:Array<string>=[];
    //check path 
    if (!fs.existsSync(dirPath)) return listFiles;
    try {
      const files=fs.readdirSync(dirPath);
      files.forEach((name) => {
        const filename=path.join(dirPath, name);
        if(fs.lstatSync(filename).isDirectory())
        {
          //Directory
          const files2=this.GetAllFile(filename);
          listFiles=files2.slice();
        }
        if(fs.lstatSync(filename).isFile())
          listFiles.push(filename);
      });
    } catch (err: any){}
    //result
    return listFiles;
  }

  static SetTimeFiles(filesPath:string[],
    timestamp:number=Date.now() /*Unix epoch, i.e. Unix timestamp*/):IotResult
  {
    let result:IotResult;
    let lastFile:string|undefined;
    try {
      filesPath.forEach(path =>{
        lastFile=path;
        utimesSync(path,timestamp); 
      });
      result= new IotResult(StatusResult.Ok, `All files have time set to ${timestamp}.`);
    } catch (err: any){
      result = new IotResult(StatusResult.Error,`time setting error ${timestamp} for file ${lastFile}.`,err);
    }
    //result
    return result;
  }

  static SetLineEnding(content:string):string
  {
    //https://github.com/Neoklosch/crlf-helper/
    //CRLF: /\r\n/g
    const re = new RegExp("\r\n", 'g');
    //LF: '\n',
    const value='\n';
    content=content.replace(re,value);
    return content;
  }

  static ShowExplorer(path:string)
  {
    const fullpath=`explorer ${path}`;
    cp.exec(fullpath, undefined);
  }

  static ValidationErrorsToString(validationErrors:string[]): string {
    let msg=`Validation messages:`;
    let index=1;
    validationErrors.forEach((item) => {
      msg=`${msg}\n${index}. ${item}`;
      index++;
    });
    return msg;
  }

  static uniqByForEach<T>(array: T[]) {
    const result: T[] = [];
    array.forEach((item) => {
        if (!result.includes(item)) {
            result.push(item);
        }
    })
    return result;
  }

}
