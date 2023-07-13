import {
  allComponents,
  provideVSCodeDesignSystem,
  Button,
  TextArea,
  TextField,
  Dropdown,
  Option,
  Checkbox
} from "@vscode/webview-ui-toolkit";

/*
import {
  Listbox,
  ListboxElement,
  ListboxOption
} from "@microsoft/fast-foundation";
*/

// In order to use the Webview UI Toolkit web components they
// must be registered with the browser (i.e. webview) using the
// syntax below.
provideVSCodeDesignSystem().register(allComponents);

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
  // To get improved type annotations/IntelliSense the associated class for
  // a given toolkit component can be imported and used to type cast a reference
  // to the element (i.e. the `as Button` syntax)
  const addButton = document.getElementById("button-submit") as Button;
  addButton.addEventListener("click", () => addSBC());

  const closeButton = document.getElementById("button-close") as Button;
  closeButton.addEventListener("click", () => closeSBC());
}

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
    }
  });
}

function setInput(content /* AddSBCConfigType */) {
  //set
  const hostInput = document.getElementById("host") as TextField;
  hostInput.value=content.host;
  const portInput = document.getElementById("port") as TextField;
  portInput.value=content.port;
  const usernameInput = document.getElementById("username") as TextField;
  usernameInput.value=content.username;
  const debugusernameInput = document.getElementById("debugusername") as Dropdown;
  debugusernameInput.innerHTML= `<vscode-option selected>${content.debugusername}</vscode-option>
  <vscode-option>root</vscode-option>`;
  const managementusernameInput = document.getElementById("managementusername") as Dropdown;
  managementusernameInput.innerHTML= `<vscode-option selected>${content.managementusername}</vscode-option>
  <vscode-option>root</vscode-option>`;
}

function addSBC() {
  console.log("addSBC");
  //get
  const hostInput = document.getElementById("host") as TextField;
  const portInput = document.getElementById("port") as TextField;
  const usernameInput = document.getElementById("username") as TextField;
  //password
  const passwordInput = document.getElementById("password") as TextField;
  const debugusernameInput = document.getElementById("debugusername") as Dropdown;
  const managementusernameInput = document.getElementById("managementusername") as Dropdown;
  //checkbox
  //<vscode-checkbox id="checkboxudev"
  const checkboxudevInput = document.getElementById("checkboxudev") as Checkbox;
  //values
  const hostInputValue = hostInput.value;
  const portInputValue = portInput.value;
  const usernameInputValue = usernameInput.value;
  const passwordInputValue = passwordInput.value;
  const debugusernameInputValue = debugusernameInput.value;
  const managementusernameInputValue =  managementusernameInput.value;
  //checkbox
  const _checkboxudevInputValue = checkboxudevInput.checked;
  let udevfilenameInputValue:string | undefined= undefined;
  if (_checkboxudevInputValue) 
    udevfilenameInputValue="20-gpio-fastiot.rules";
  //data
  const AddSBCConfigData:AddSBCConfigType= {
    host:hostInputValue,
    port: +portInputValue,
    username: usernameInputValue,
    password: passwordInputValue,
    udevfilename: udevfilenameInputValue,
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

function closeSBC() {
  console.log("closeSBC");
  //message
  const message = {
    command: "answerClose"
  };
  //send
  vscode.postMessage(message);
}

/*********************************************/
/*    from \src\Types\AddSBCConfigType.ts    */

/**
 * Custom type for the first connection to the SBC.
 */
export type AddSBCConfigType = {
  /** Hostname or IP address of the server. */
  host: string;
  /** Port number of the server. */
  port?: number;
  /** Username for authentication. */
  username?: string;
  /** Password for password-based user authentication. */
  password?: string;
  /** ssh keytype for key generation. Ex: ed25519-256 */
  sshkeytype?: string;
  /** Filename for udev rule. Ex: 20-gpio-fastiot.rules */
  udevfilename?: string;
  // TODO: List of udev rules filenames
  /** List of udev rules filenames */
  //udevfilenamelist?: string[];
  /** Username for debug. Ex: debugvscode */
  debugusername?: string;
  /** Groups for debugusername. Ex: gpio, i2c, and etc. */
  debuggroups?: string;
  /** Username for management. Ex: managementvscode */
  managementusername?: string;
  /** Group for managementusername. Ex: sudo */
  managementgroup?: string;
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


/**************************************************************/
