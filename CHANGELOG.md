# Changelog

## v0.3.3 (28-04-2023)

- Added parameter `fastiot.template.community.updatesource`, update source for community project templates. Adds the ability to download templates from third-party resources.
- Added the default selection of the "Projects" folder for placing projects, the parameter `fastiot.template.defaultprojectfolder`.
- Added support for .NET Runtime and SDK 8.0.
- Turns off telemetry in CLI .NET on the device.
- Added automatic addition of keys `fastiotIdLaunch`, `fastiotIdDevice`, `fastiotProject`, `fastiotIdTemplate` for Launch if they are not in the template. Those. these fields are now optional for the template.
- Added parameter `fastiot.loglevel`, logging level. The default value is `Information`, displays only the main events, the value `Debug` - displays detailed information about the events.
- Added parameter `fastiot.debug`, debug. Designed for debugging entities such as templates. When enabled, saves additional debugging information.
- Added choice of key encryption algorithm for a device from the list, instead of entering values, parameter `fastiot.device.ssh.keytype`. Additionally, custom arbitrary values are available.
- Added selection options to Launch.
- Added command to launch SSH terminal in TERMINAL window.
- Added commands and hotkeys to launch the extension.
- Added FileSystemWatcher function to monitor Launch changes outside of the extension.
- Added project creation buttons to the Welcome Panel.
- Improved UI.

## v0.3.2 (24-03-2023)

- Added output of diagnostic information when connecting via ssh protocol.
- Added stdErr and codeErr output at the end of ssh script execution.
- Fixed the problem of long execution of scripts when adding a device.
- Added parameter `fastiot.template.loadonstart`, you can disable the loading of templates at the start of the extension.
- Added parameter `fastiot.template.updateinterval`, time interval between template updates.
- Added parameter `fastiot.template.isupdate`, disables template updates.
- Added `Restore/upgrade system templates` command to restore system templates.
- Variables added for project templates: `%{extension.apps.builtin.aswindows}`, `%{os.userinfo.username}`.
- Compliance with UX Guidelines is done.
- Improved UI.
- Changed the description of the settings.
- Added Crlf normalization for bash scripts.
- Fixed bugs.

## v0.3.1 (27-02-2023)

- Bugs fixed.

## v0.3.0 (24-02-2023)

- Added support for using templates for projects, including custom ones.
- Added loading/updating templates for projects from external resources. So far, only system templates have been updated.
- Added support for multiple Launch for project templates with overlapping tasks, i.e. if one of the Launches is deleted, the tasks used in the other Launches will not be deleted.
- The `sshd_config` configuration file of the OpenSSH server is automatically configured, now you need to set only two parameters "PermitRootLogin yes" and "PasswordAuthentication yes" to start.
- Extension resources, such as device keys, templates, are now stored by default in the home folder, for example `C:\Users\Anton\fastiot`.
- Added key algorithm settings for ssh authorization. You can specify the algorithm type (default ed25519) and key length (default 256).
- Added a detailed description of the solution to the problem in case of impossibility to connect to the device. Availability is checked separately by: ip-address, port, ssh-protocol.
- Added package Mono (experimental).
- Fixed bugs: loading DTO binary file, saving Gpiochips and DTO configuration, importing device configuration.
- Some visual changes.

## v0.2.2 (24-01-2023)

- Bugs fixed.

## v0.2.1 (24-01-2023)

- Changed key type used to connect from rsa to rsa-sha2-256.
- Added "PubkeyAcceptedAlgorithms=+ssh-rsa" line to `/etc/ssh/sshd_config` configuration file.

## v0.2.0 (14-04-2022)

- Bugs fixed.

## v0.1.5 (12-04-2022)

- [Issue 1](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/issues/1 "Issue 1"). Added a template for creating a launch name. See [Launch-title-template](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/blob/master/docs/Launch-title-template.md "Launch-title-template").
- Added option to install Libgpiod from repository or from source.
- Added board model detection for Raspberry Pi.
- Added support for .NET Runtime & SDK 7.0.
- Implemented the function of testing/verifying the installed package.
- Test project added [dotnet-iot-fastiot-test](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/tree/master/samples/dotnet-iot-fastiot-test "dotnet-iot-fastiot-test").
- Added device shutdown command.
- Added ignoring comments ('//') to launch.json and tasks.json.
- Some visual changes.
- Updated documentation.

## v0.1.4 (29-12-2021)

- First public build.
