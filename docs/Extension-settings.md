# Extension settings

To change the extension settings, open the menu item `File > Preferences > Settings`. Then go to the `User` tab and select `Extensions`.

⚠️ After changing the settings, it is advisable to restart the extension.

![VSCode dotnet FastIoT](vscode-dotnet-fastiot-settings-1.png)

Settings:

- **Fastiot: Debug** - debug entities such as templates. When enabled, saves additional debugging information.
- **Fastiot › Device › Account: Group** - group of users in Linux on a remote device (for example, Raspberry Pi), to which an account (`debugvscode`) will be added to manage the device. This group must have Administrator rights. Default value: `sudo`.
- **Fastiot › Device › Account: Username** - account name, created on the remote device. Used to control the device and perform remote debugging. Default value: `debugvscode`.
- **Fastiot › Device › All: JSON** - device settings in JSON format, it is not recommended to change them manually. Due to incorrect changes, the device list may not load.
- **Fastiot › Device: Applicationdatafolder** - a shared folder for storing access keys to devices (for example, Raspberry Pi), templates, extension settings. Default value: `%userprofile%\fastiot`. Example: `C:\Users\Anton\fastiot`.
- **Fastiot › Device › Ssh › Key: Custombits** - custom key length value in bits. Overrides the setting: `Fastiot › Device › Ssh: Keytype`. Example: `256`.
- **Fastiot › Device › Ssh › Key: Customtype** - the name of the custom algorithm used to generate the key. Overrides the setting: `Fastiot › Device › Ssh: Keytype`. Example: `ed25519`.
- **Fastiot › Device › Ssh: Keytype** - the name of the algorithm, the length of the key, to generate the key, used to enter the remote device. If you choose the `rsa` algorithm, then you will need to add the line `PubkeyAcceptedAlgorithms=+ssh-rsa` to the `/etc/ssh/sshd_config` file. For more information about key algorithms, see [How To Set Up SSH Keys](https://goteleport.com/blog/how-to-set-up-ssh-keys/). Default value: `ed25519-256`.
- **Fastiot: Isupdate** - enable/disable updating of entities, such as templates, from Internet resources. Default value: `true`.
- **Fastiot › Launch: Templatetitle** - template for forming the name of Launch. Variable values can be viewed at [link](Launch-title-template_ru.md "Template for forming the name Launch"). Default value: `Launch on %{device.label} (%{project.name}, %{device.board.name}, %{device.user.debug})`.
- **Fastiot: Loglevel** - event logging level. The `Information` value displays only the main events, the `Debug` value displays detailed information about the events. Default value: `Information`.
- **Fastiot › Template › Community: Updatesource** - update source for community templates. Adds the ability to download templates from third-party resources. Example: `htts://url1/list.yaml;htts://url2/list.yaml`. The structure of the `list.yaml` file in YAML format must match the structure of the file [templatelist.fastiot.yaml](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/blob/master/templates/system/templatelist. fastiot.yaml). Template files in zip archive format must be placed in the directory along with the `list.yaml` file.
  - **Fastiot › Template: Defaultprojectfolder** - `Projects` folder to select the default project location. Example: `C:\Users\Anton\Documents\Projects`.
- **Fastiot › Template: Loadonstart** - loading templates at extension start. If this option is disabled, templates will only be loaded the first time they are accessed. Default value: `true`.
- **Fastiot: Updateinterval** - template update interval in hours. Default value: `1 day`.
