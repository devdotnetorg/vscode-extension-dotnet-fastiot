## Launch title template

TODO

Default Template: Launch on %DEVICE_LABEL% (%NAME_PROJECT%, %BOARD_NAME%, %USER_DEBUG%)

Merge result example: Launch on cubieboard (dotnet-iot-fastiot-test, Cubieboard, debugvscode)

Variables for creating the launch configuration name:

- %TARGET_FRAMEWORK% => "net5.0"
- %NAME_PROJECT% => "dotnet-iot-fastiot-test"
- %PATH_PROJECT% => "dotnet-iot-fastiot-test.csproj"
- %PATH_PROJECT_REVERSE% => "dotnet-iot-fastiot-test.csproj"
- %USER_DEBUG% => "debugvscode"
- %REMOTE_HOST% => "192.168.43.14"
- %DEVICE_LABEL% => "cubieboard"
- %BOARD_NAME% => "Cubieboard"

If additional variables are needed, then create [ISSUE](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/issues "issues")