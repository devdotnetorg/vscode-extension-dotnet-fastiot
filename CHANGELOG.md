# Changelog

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
- Test project added [dotnet-iot-fastiot-test](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/tree/master/Samples/dotnet-iot-fastiot-test "dotnet-iot-fastiot-test").
- Added device shutdown command.
- Added ignoring comments ('//') to launch.json and tasks.json.
- Some visual changes.
- Updated documentation.

## v0.1.4 (29-12-2021)

- First public build.
