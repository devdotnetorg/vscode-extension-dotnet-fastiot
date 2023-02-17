import * as vscode from 'vscode';
//import * as fs from 'fs';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import {IoTHelper} from './IoTHelper';

export class dotnetHelper {

  static GetDotNetRID(osName:string,architecture:string): string {
    // TODO: check rid
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

  /**
   * appname is used also as namespaces and rules for namespaces in C# are more restrictive
   * than those for folder names, so we have a custom check function
   * @param value appname
   */
  static CheckDotNetAppName(value:string) {
  //V1=^[a-zA-Z][a-zA-Z0-9_.]*[a-zA-Z0-9_]$
  //V2=^[A-Za-z]+[\s][A-Za-z]+[.][A-Za-z]+$
  var r = new RegExp("^[A-Za-z]+[\s][A-Za-z]+[.][A-Za-z]+$");
  return r.test(value);
  }

  static GetDotNetTargets(): Map<string,string[]> {
    //from https://learn.microsoft.com/en-us/dotnet/standard/frameworks
    let dictionary = new Map<string,string[]>();
    dictionary.set("7.0",["net7.0",".NET 7"]);
    dictionary.set("6.0",["net6.0",".NET 6"]);
    dictionary.set("5.0",["net5.0",".NET 5"]);
    dictionary.set("3.1",["netcoreapp3.1",".NET Core 3.1"]);
    return dictionary;
  }

  static GetDotNetValidNamespace(value:string): string {
    value=IoTHelper.StringTrim(value);
    value=IoTHelper.ConvertToValidFilename(value,"_");
    const re = new RegExp('-', 'g');
    value=value.replace(re,'_'); 
    return value;
  }

  static GetTargetFrameworkFromCsprojFile(filePath:string): string|undefined {
    try {
      //read *.csproj for get TargetFramework
      const xmlFile:string= fs.readFileSync(filePath, 'utf8');
      let xpath = require('xpath');
      let dom = require('xmldom').DOMParser;
      let doc = new dom().parseFromString(xmlFile);
      let nodes = xpath.select("//TargetFramework", doc);
      const targetFramework=nodes[0].firstChild.data;
      return targetFramework;
    } catch (err: any){
      return undefined;
    } 
  }
}
