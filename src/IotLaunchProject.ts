import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {BaseTreeItem} from './BaseTreeItem';
import {IotDevice} from './IotDevice';
 
export class IotLaunchProject { 

  private readonly _depthLevel:number =4;
  
  private _workspaceDirectory:string|undefined;
  public get WorkspaceDirectory(): string|undefined {
    return this._workspaceDirectory;}        
  private _fullPath:string|undefined;
  public get FullPath(): string|undefined {
    return this._fullPath;}        
  private _name:string|undefined;
  public get Name(): string|undefined {
    return this._name;}    
  private _relativePath:string|undefined;  
  public get RelativePath(): string|undefined {
    return this._relativePath;}      
  private _folderPath:string|undefined;  
  public get FolderPath(): string|undefined {
    return this._folderPath;}          
  private _relativeFolderPath:string|undefined;  
  public get RelativeFolderPath(): string|undefined {
    return this._relativeFolderPath;}        
  private _cyPath:string|undefined;  
  public get CyPath(): string|undefined {
    return this._cyPath;}      

  constructor(){    
  };
  //DELL
  public Build(workspaceDirectory:string, fullPath:string){    
    //FullPath
    this._fullPath=fullPath;
    this._workspaceDirectory=workspaceDirectory;
    //Name
    let objArray=this._fullPath.split("\\"); 
    this._name=objArray[objArray.length-1].substring(0,objArray[objArray.length-1].length-7);
    //RelativePath
    this._relativePath=fullPath.substring((<string>this.WorkspaceDirectory).length+1);    
    //RelativeFolderPath
    this._relativeFolderPath=path.dirname(this._relativePath);
    //folderPath    
    this._folderPath=path.dirname(fullPath);
    //Rsync
    objArray=(<string>this._folderPath).split("\\"); 
    objArray[0]=objArray[0].replace(":","");
    this._cyPath="/cygdrive";
    objArray.forEach(element =>{
      this._cyPath=this._cyPath+`/${element}`;
    });
  }
  //DELL
  public FindProjects(pathFolder:string): Array<string>{    
    //search for projects in depth on three levels
    //const projects = this.GetProjectsFromFolder(pathFolder,"csproj", this._depthLevel,undefined);    
    let projects:Array<string>=[];
    return projects;
  }
  //DELL
  private GetProjectsFromFolder(pathFolder:string, fileExtension:string, depthLevel:number| undefined,currenDepthLevel:number| undefined): Array<string> {
    let result:Array<string>=[];
    if(depthLevel){
      if(currenDepthLevel)
      {
        if(currenDepthLevel>depthLevel) return result;
      }
    }
    //    
    let files=fs.readdirSync(pathFolder);
    files.forEach((name) => {
      const filename=`${pathFolder}\\${name}`;      
      if(fs.lstatSync(filename).isDirectory())
        {          
          if(!currenDepthLevel) currenDepthLevel=0;
          currenDepthLevel++
          const result2=this.GetProjectsFromFolder(filename, fileExtension, depthLevel,currenDepthLevel);
          result2.forEach((element) => {
            result.push(element);
          });          
        } 
      if(fs.lstatSync(filename).isFile())
        {
          if(filename.split('.').pop()==fileExtension)
          {
            console.log(filename);
            result.push(filename);
          }          
        }       
    });
    //
    return result;     
  }       
}
