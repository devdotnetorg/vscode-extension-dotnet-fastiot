/*************       custom       ************/

import {
  allComponents,
  provideVSCodeDesignSystem,
  Button,
  Tag,
  TextField,
  Dropdown,
  Checkbox,
  Option
} from "@vscode/webview-ui-toolkit";

//@bendera/vscode-webview-elements
import '@bendera/vscode-webview-elements/dist/vscode-collapsible';

/*
import {
  Listbox,
  ListboxElement,
  ListboxOption
} from "@microsoft/fast-foundation";
*/

/*********************************************/
/***      do not change the main code      ***/

provideVSCodeDesignSystem().register(allComponents,Option);

// Get access to the VS Code API from within the webview context
const vscode = acquireVsCodeApi();
// Just like a regular webpage we need to wait for the webview
// DOM to load before we can reference any of the HTML elements
// or toolkit components
window.addEventListener("load", main);

function main() {
  setVSCodeMessageListener();
  //message
  const message:MessagePanelType = {
    command: "requestData"
  };
  vscode.postMessage(message);

  //Buttons
  const addButton = document.getElementById("button-submit") as Button;
  addButton.addEventListener("click", () => onClickButtonSubmit());
  const closeButton = document.getElementById("button-close") as Button;
  closeButton.addEventListener("click", () => onClickButtonClose());

  /*********************************************/
  /*************       custom       ************/


}

/*********************************************/
/***      do not change the main code      ***/
function setVSCodeMessageListener() {
  window.addEventListener("message", (event) => {
    const message = event.data as MessagePanelType;
    const command = message.command;
    switch (command) {
      case "receiveDataInWebview":
        const content = JSON.parse(message.content ?? "{}");
        setInput(content);
      break;
      case "updateTitle":
        const title=message.content ?? "None";
        console.log(title);
        //web page's title
        document.title = title;
        //h1
        const element = document.getElementById("title") as HTMLElement;
        element.innerHTML = title;
      break;
/*********************************************/
/*************       custom       ************/


    }
  });
}

function setInput(content:AddSBCConfigType) {
  //set
  const hostInput = document.getElementById("host") as TextField;
  hostInput.value=content.host;
  const portInput = document.getElementById("port") as TextField;
  portInput.value=content.port.toString();
  const usernameInput = document.getElementById("username") as TextField;
  usernameInput.value=content.username;
  const debugusernameInput = document.getElementById("debugusername") as Dropdown;
  debugusernameInput.innerHTML= `<vscode-option selected>${content.debugusername}</vscode-option>
  <vscode-option>root</vscode-option>`;
  const managementusernameInput = document.getElementById("managementusername") as Dropdown;
  managementusernameInput.innerHTML= `<vscode-option selected>${content.managementusername}</vscode-option>
  <vscode-option>root</vscode-option>`;
  //groups
  let tags=<string[]>content.debuggroups;
  renderTags("container-tags-debuggroups",tags);
  tags=<string[]>content.managementgroups;
  renderTags("container-tags-managementgroups",tags);
  //text account
  const debuggroupstext = document.getElementById("debuggroupstext") as Element;
  debuggroupstext.innerHTML= `The ${content.debugusername} account will be added to the group(s):`;
  const managementgroupstext = document.getElementById("managementgroupstext") as Element;
  managementgroupstext.innerHTML= `The ${content.managementusername} account will be added to the group(s):`;
  //Udevrules
/*
   filenameudevrules: string;
  listUdevRulesFiles?: string[];
  */
  const filenameudevrulesInput = document.getElementById("filenameudevrules") as Dropdown;
  if(!content.listUdevRulesFiles) content.listUdevRulesFiles=[];
  let item:Option;
  if(content.listUdevRulesFiles.includes(content.filenameudevrules)) {
    //contains
    item = new Option(content.filenameudevrules,content.filenameudevrules,true,true);
    filenameudevrulesInput.appendChild(item);
    //remove content.filenameudevrules
    const index = content.listUdevRulesFiles.indexOf(content.filenameudevrules, 0);
    if (index > -1) {
      content.listUdevRulesFiles.splice(index, 1);
    }
    //add None
    content.listUdevRulesFiles.push("None");
  }else {
    //None
    item = new Option("None","None",true,true);
    filenameudevrulesInput.appendChild(item);
  }
  for (let value of content.listUdevRulesFiles) {
    item = new Option(value,value,false,false);
    filenameudevrulesInput.appendChild(item);
  }
}

function onClickButtonSubmit() {
  //get
  const hostInput = document.getElementById("host") as TextField;
  const portInput = document.getElementById("port") as TextField;
  const usernameInput = document.getElementById("username") as TextField;
  //password
  const passwordInput = document.getElementById("password") as TextField;
  const debugusernameInput = document.getElementById("debugusername") as Dropdown;
  const managementusernameInput = document.getElementById("managementusername") as Dropdown;
  const filenameudevrulesInput = document.getElementById("filenameudevrules") as Dropdown;
  //values
  const hostInputValue = hostInput.value;
  const portInputValue = portInput.value;
  const usernameInputValue = usernameInput.value;
  const passwordInputValue = passwordInput.value;
  const debugusernameInputValue = debugusernameInput.value;
  const managementusernameInputValue =  managementusernameInput.value;
  const filenameudevrulesInputValue =  filenameudevrulesInput.value;
  //data
  const AddSBCConfigData:AddSBCConfigType= {
    host:hostInputValue,
    port: +portInputValue,
    username: usernameInputValue,
    password: passwordInputValue,
    filenameudevrules: filenameudevrulesInputValue,
    debugusername: debugusernameInputValue,
    managementusername: managementusernameInputValue
  }
  //message
  const message:MessagePanelType = {
    command: "answerData",
    content:  JSON.stringify(AddSBCConfigData) 
  };
  //send
  vscode.postMessage(message);
}

function renderTags(idContainer:string, tags:string[]) {
  const tagsContainer = document.getElementById(idContainer);
  clearTagGroup(tagsContainer);
  if (tags.length > 0) {
    addTagsToTagGroup(tags, tagsContainer);
    if (tagsContainer) {
      tagsContainer.style.marginBottom = "2rem";
    }
  } else {
    // Remove tag container bottom margin if there are no tags
    if (tagsContainer) {
      tagsContainer.style.marginBottom = "0";
    }
  }
}

function clearTagGroup(tagsContainer) {
  while (tagsContainer.firstChild) {
    tagsContainer.removeChild(tagsContainer.lastChild);
  }
}

function addTagsToTagGroup(tags:string[], tagsContainer) {
  for (const tagString of tags) {
    const vscodeTag = document.createElement("vscode-tag") as Tag;
    vscodeTag.textContent = tagString;
    tagsContainer.appendChild(vscodeTag);
  }
}

/*********************************************/
/***      do not change the main code      ***/

function onClickButtonClose() {
  //message
  const message = {
    command: "answerClose"
  };
  //send
  vscode.postMessage(message);
}
/*********************************************/
/**************      Types      **************/
/*    from \src\Types\AddSBCConfigType.ts    */

/**
 * Custom type for the first connection to the SBC.
 */
export type AddSBCConfigType = {
  /** Hostname or IP address of the server. */
  host: string;
  /** Port number of the server. */
  port: number;
  /** Username for authentication. */
  username: string;
  /** Password for password-based user authentication. */
  password?: string;
  /** ssh keytype for key generation. Ex: ed25519-256 */
  sshkeytype?: string;
  /** Filename for udev rule. Ex: 20-gpio-fastiot.rules */
  filenameudevrules: string;
  /** List of udev rules filenames */
  listUdevRulesFiles?: string[];
  /** Username for debug. Ex: debugvscode */
  debugusername: string;
  /** Groups for debugusername. Ex: gpio, i2c, and etc. */
  debuggroups?: string[];
  /** Username for management. Ex: managementvscode */
  managementusername: string;
  /** Groups for managementusername. Ex: sudo */
  managementgroups?: string[];
};

/*    from \src\Types\MessagePanelType.ts    */

/**
 * Custom type declaration representing a message for panel.
 */
export type MessagePanelType = {
  content?: string;
} & BaseMessagePanelType;

/*    from \src\Types\BaseMessagePanelType.ts    */

/**
 * Custom type declaration representing a base message panel.
 */
export type BaseMessagePanelType = {
  command: string;
  tag?: string;
};

/*********************************************/
