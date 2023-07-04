import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IotResult,StatusResult } from '../IotResult';
import { IYamlValidator } from './IYamlValidator';
import { IoTHelper } from '../Helper/IoTHelper';

export class YamlRedHatServiceSingleton {
  private static instance: YamlRedHatServiceSingleton;
  //
  private readonly _identifierExtension="redhat.vscode-yaml";
  private readonly _SCHEMA = "myschema";
  private readonly _timeout = 60; // 30 sec
  private _yamlExtension:vscode.Extension<any> | undefined;
  private _yamlExtensionAPI:any;
  private _schemas:Map<string,string>= new Map<string,string>();
  private _currentYamlFile:vscode.Uri=vscode.Uri.file("c://non");
  private _validationErrors:Array<string>=[];
  private _responseReceivedFlag=false;
  /**
   * Конструктор Одиночки всегда должен быть скрытым, чтобы предотвратить
   * создание объекта через оператор new.
   */
  private constructor() { }

  /**
   * Статический метод, управляющий доступом к экземпляру одиночки.
   *
   * Эта реализация позволяет вам расширять класс Одиночки, сохраняя повсюду
   * только один экземпляр каждого подкласса.
   */
  public static getInstance(): YamlRedHatServiceSingleton {
    if (!YamlRedHatServiceSingleton.instance) {
      YamlRedHatServiceSingleton.instance = new YamlRedHatServiceSingleton();
    }
    return YamlRedHatServiceSingleton.instance;
  }

  private async InstallExtension(): Promise<IotResult> {
    let result:IotResult;
    let msg:string;
    try {
      msg=`You need to install the Red Hat's YAML ("${this._identifierExtension}") extension ` +
      `for .NET FastIoT to work. The installation will now complete. Please wait 2-3 minutes.`;
      vscode.window.showWarningMessage(msg);
      //StatusBar
      let statusBarBackground= vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right, 1000);
      msg=`Install Red Hat's YAML extension`;
      statusBarBackground.text=`$(loading~spin) ${msg}`;
      statusBarBackground.tooltip=msg;
      //Install
      await vscode.commands.executeCommand(
        `workbench.extensions.installExtension`,
        `${this._identifierExtension}`
      );
      //
      statusBarBackground.hide();
      statusBarBackground.dispose();
      //repeat
      this._yamlExtension = vscode.extensions.getExtension(this._identifierExtension);
      if(this._yamlExtension) {
        msg=`Red Hat's extension successfully installed`;
        vscode.window.showInformationMessage(msg);
        result= new IotResult(StatusResult.Ok, msg);
      }else {
        msg=`Red Hat's YAML extension failed to install`;
        vscode.window.showErrorMessage(msg);
        result= new IotResult(StatusResult.Error, msg);
      }
    } catch (err: any){
      //result
      msg=`Red Hat's YAML extension failed to install`;
      vscode.window.showErrorMessage(msg);
      result= new IotResult(StatusResult.Error, msg);
    }
    return Promise.resolve(result);
  }

  private onRequestSchemaURI(resource: string): string | undefined {
    if (resource.endsWith('.yaml')) {
      const filename = path.parse(resource).base;
      //ex: "myschema://schema/template.fastiot"
      return `${this._SCHEMA}://schema/${filename}`;
    }
    return undefined;
  }
  
  private onRequestSchemaContent(schemaUri: string): string | undefined {
    const parsedUri = vscode.Uri.parse(schemaUri);
    if (parsedUri.scheme !== this._SCHEMA) {
      return undefined;
    }
    if (!parsedUri.path || !parsedUri.path.startsWith('/')) {
      return undefined;
    }
    //get schema
    const schema = this._schemas.get(schemaUri);
    //ex: "file:///d:/Anton/GitHub/vscode-extension-dotnet-fastiot/schemas/template.fastiot.schema.yaml"
    return schema;
  }

  /**
   * redhat.vscode-yaml extension activation
   */
  public async Activate(): Promise<IotResult> {
    //check
    if(this._yamlExtension && this._yamlExtension.isActive && this._yamlExtensionAPI) {
      //ok
      return Promise.resolve(new IotResult(StatusResult.Ok, "Red Hat's YAML extension is active"));
    }
    let result:IotResult;
    let msg:string;
    try {
      this._yamlExtension = vscode.extensions.getExtension(this._identifierExtension);
      if(!this._yamlExtension) {
        //need install
        result=await this.InstallExtension();
        if(result.Status==StatusResult.Error) return Promise.resolve(result);
      }
      //activate
      this._yamlExtensionAPI = await this._yamlExtension?.activate();
      //register
      this._yamlExtensionAPI.registerContributor(this._SCHEMA, this.onRequestSchemaURI, this.onRequestSchemaContent);
      //Diagnostics
      vscode.languages.onDidChangeDiagnostics(e => {
        e.uris.forEach(fileUri => {
          if(this._currentYamlFile==fileUri) {
            let diagnostics = vscode.languages.getDiagnostics(fileUri);  // returns an array
            this._validationErrors=[];
            diagnostics.forEach(item => {
              this._validationErrors.push(item.message);
            });
            //
            this._responseReceivedFlag=true;
				    //close file
				    this.closeFileIfOpen(fileUri);
          }
        });
			});
      //next
      result= new IotResult(StatusResult.Ok, "Red Hat's YAML extension is active");
    } catch (err: any){
      //result
      const errorMsg="Red Hat's YAML extension is not active";
      result = new IotResult(StatusResult.Error,errorMsg,err);
    }
    return Promise.resolve(result);
  }

  private AddSchema(schemaFilePath:string) {
    //template.fastiot.schema.yaml
    const filename = path.parse(schemaFilePath).base;
    let key = filename.substring(0,filename.length-12);
    //ex: "myschema://schema/template.fastiot"
    key=`${this._SCHEMA}://schema/${key}`;
    //exist
    if(this._schemas.has(key)) return;
    //add
    this._schemas.set(key,schemaFilePath);
  }

  public async ValidateSchema (yamlFilePath:string, schemaFilePath:string):Promise<IotResult> {
    let result:IotResult;
    try {
      //Add schema
      this.AddSchema(schemaFilePath);
      //for response handler
      this._currentYamlFile=vscode.Uri.file(yamlFilePath);
      //adding a file to processing
      this._responseReceivedFlag=false;
      let ymldoc = await vscode.workspace.openTextDocument(vscode.Uri.file(yamlFilePath));
      //waiting response
      for (let i = 0; i < this._timeout; i++) {
        IoTHelper.Sleep(500);
        if(this._responseReceivedFlag) i=this._timeout;
      }
      //response
      if(this._responseReceivedFlag) {
        //ok
        const msg=`Response received from Red Hat's YAML extension`;
        result = new IotResult(StatusResult.Error,msg);
        if(this._validationErrors.length>0) {
          result.returnObject=this._validationErrors;
        }
      }else {
        //no response received
        const errorMsg=`No response received from Red Hat's YAML extension. ValidateSchema pathFileYml = ${yamlFilePath}, schemaFileName = ${schemaFilePath}`;
        result = new IotResult(StatusResult.Error,errorMsg);
      }
    } catch (err: any){
      //result
      const errorMsg=`Red Hat's YAML extension error ValidateSchema pathFileYml = ${yamlFilePath}, schemaFileName = ${schemaFilePath}`;
      result = new IotResult(StatusResult.Error,errorMsg,err);
    }
    return Promise.resolve(result);
  }

  private async closeFileIfOpen(file:vscode.Uri) : Promise<void> {
    const tabs: vscode.Tab[] = vscode.window.tabGroups.all.map(tg => tg.tabs).flat();
    const index = tabs.findIndex(tab => tab.input instanceof vscode.TabInputText && tab.input.uri.path === file.path);
    if (index !== -1) {
        await vscode.window.tabGroups.close(tabs[index]);
    }
  }
}


  