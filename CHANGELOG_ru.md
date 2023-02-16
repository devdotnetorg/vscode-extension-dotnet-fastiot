# Changelog

## v0.2.2 (24-01-2023)

- Исправлены ошибки.

## v0.2.1 (24-01-2023)

- Изменен тип ключа используемый для подключения с rsa на rsa-sha2-256.
- Добавлена строка "PubkeyAcceptedAlgorithms=+ssh-rsa" в файл конфигурации `/etc/ssh/sshd_config`.

## v0.2.0 (14-04-2022)

- Исправлены ошибки.

## v0.1.5 (12-04-2022)

- [Issue #1](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/issues/1 "Issue #1"). Добавлен шаблон для названия профиля запуска проекта. См. [Launch-title-template](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/blob/master/docs/Launch-title-template.md "Launch-title-template").
- Добавлена возможность установки Libgpiod из репозитория или из исходников.
- Добавлено определение модели платы для Raspberry Pi.
- Добавлена поддержка .NET Runtime и SDK 7.0.
- Реализована функция тестирования/проверки установленного пакета.
- Добавлен тестовый проект [dotnet-iot-fastiot-test](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/tree/master/Samples/dotnet-iot-fastiot-test "dotnet-iot-fastiot-test").
- Добавлена команда выключения устройства.
- Добавлено игнорирование комментариев ('//') для launch.json и tasks.json.
- Некоторые визуальные изменения.
- Обновлена документация.

## v0.1.4 (29-12-2021)

- Первый публичный билд.
