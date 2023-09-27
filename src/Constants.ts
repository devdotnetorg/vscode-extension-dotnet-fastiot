//import { Constants } from "../Constants"

export namespace Constants {
  export const nameFolderSettings = "fastiot";
  export const nameFolderProjects = "Projects";
  export const urlUpdateTemplatesSystemRelease = "https://raw.githubusercontent.com/devdotnetorg/vscode-extension-dotnet-fastiot/master/templates/system/templatelist.fastiot.yaml";
  export const urlUpdateTemplatesSystemDebug = "https://raw.githubusercontent.com/devdotnetorg/vscode-extension-dotnet-fastiot/dev/templates/system/templatelist.fastiot.yaml";
  export const fileNameUdevRules = "20-gpio-fastiot.rules";
  export const folderDestForFileUdevRules = "/etc/udev/rules.d";
  //
  export const whiteListForWebView = {
    //html
    span:["class","slot"],
    div:["class"],
    p:[],
    //components
    //https://github.com/microsoft/vscode-webview-ui-toolkit/blob/main/docs/components.md
    "vscode-badge":[],
    "vscode-checkbox":["id","autofocus","checked","disabled","readonly","required",
      "value"],
    "vscode-text-field": ["id","autofocus","disabled","maxlength","name","placeholder",
      "readonly","size","type","value"],
    "vscode-divider":["role"],
    "vscode-dropdown":["id","disabled", "open","position"],
    "vscode-option":["disabled","selected","value"],
    "vscode-link":["download","href","hreflang","ping","referrerpolicy","rel",
      "target","type"],
    "vscode-panels":["activeid"],
    "vscode-panel-tab":["id"],
    "vscode-panel-view":["id"],
    "vscode-radio":["id","checked","disabled","readonly","value"],
    "vscode-radio-group":["id","disabled","name","orientation","readonly"],
    "vscode-tag":[],
    "vscode-text-area":["id","autofocus","cols","disabled","form","maxlength","name",
      "placeholder","readonly","resize","rows","value"],
    //Bendera - VSCode Webview Elements
    //https://bendera.github.io/vscode-webview-elements/components/vscode-table/
    "vscode-collapsible":["title","open","description","class"],
    "vscode-icon":["id","name","action-icon","aria-role","title","slot"],
    "vscode-scrollable":[]
  };
}