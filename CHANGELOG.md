# Changelog

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
