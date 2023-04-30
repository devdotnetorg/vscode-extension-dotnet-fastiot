[![Version](https://vsmarketplacebadges.dev/version-short/devdotnetorg.vscode-extension-dotnet-fastiot.svg)](https://marketplace.visualstudio.com/items?itemName=devdotnetorg.vscode-extension-dotnet-fastiot) [![License](https://img.shields.io/badge/License-LGPL3.0-blue.svg)](LICENSE) [![Github Issues](https://img.shields.io/github/issues/devdotnetorg/vscode-extension-dotnet-fastiot.svg)](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/issues) [![GitHub last commit](https://img.shields.io/github/last-commit/devdotnetorg/vscode-extension-dotnet-fastiot/dev)](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/) [![GitHub Repo stars](https://img.shields.io/github/stars/devdotnetorg/vscode-extension-dotnet-fastiot)](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/) [![Installs](https://img.shields.io/visual-studio-marketplace/i/devdotnetorg.vscode-extension-dotnet-fastiot)](https://marketplace.visualstudio.com/items?itemName=devdotnetorg.vscode-extension-dotnet-fastiot) [![Downloads](https://img.shields.io/visual-studio-marketplace/d/devdotnetorg.vscode-extension-dotnet-fastiot)](https://marketplace.visualstudio.com/items?itemName=devdotnetorg.vscode-extension-dotnet-fastiot) [![Visual Studio Marketplace Last Updated](https://img.shields.io/visual-studio-marketplace/last-updated/devdotnetorg.vscode-extension-dotnet-fastiot)](https://marketplace.visualstudio.com/items?itemName=devdotnetorg.vscode-extension-dotnet-fastiot) [![Rating](https://img.shields.io/visual-studio-marketplace/stars/devdotnetorg.vscode-extension-dotnet-fastiot)](https://marketplace.visualstudio.com/items?itemName=devdotnetorg.vscode-extension-dotnet-fastiot)

# .NET FastIoT VS Code Extension

Расширение [.NET FastIoT](https://marketplace.visualstudio.com/items?itemName=devdotnetorg.vscode-extension-dotnet-fastiot ".NET FastIoT Extension") в Visual Studio Code Marketplace.

[README](README.md "README") in English | [README](README_ru.md "README") на русском языке | DevDotNet.ORG (Russian) - [последние новости](https://devdotnet.org/tag/fastiot/ "devdotnet.org/tag/fastiot") | Habr.com (Russian) - [Простая разработка IoT приложений на C# для Raspberry Pi и других одноплатников, на Linux](https://habr.com/ru/company/timeweb/blog/597601/ "Простая разработка IoT приложений на C# для Raspberry Pi и других одноплатников, на Linux").

Расширение настраивает встраиваемое устройство на архитектуре ARMv7 или ARMv8, работающее под Linux, для запуска .NET приложений, и конфигурирует проекты `*.csproj` для удаленной отладки по ssh-туннелю. Работает только на Windows (64 бит).

Поддерживаются устройства: Raspberry Pi, Banana Pi, Orange Pi, Radxa, Tinkerboard, Odroid, Khadas VIM, NanoPi, Pine.

*Интерфейс расширения .NET FastIoT*

![.NET FastIoT title](docs/vscode-dotnet-fastiot.png)

![.NET FastIoT interface](docs/vscode-dotnet-fastiot-interface_ru.png)

## Возможности

1. Простая установка .NET SDK, .NET Runtimes, .NET Debugger (vsdbg), библиотеки Libgpiod, Docker для Linux;
2. Создание проекта из готового шаблона с возможностью удаленной отладки;
3. Настройка уже существующих проектов на .NET для удаленной отладки;
4. Создание пользовательских шаблонов проектов и конфигурации удаленной отладки;
5. Управление файлами наложения устройств (Device Tree overlays). Требуется для включения/выключения таких устройства как I2C, SPI, PWM, и т. д. Более подробно в публикации [Работа с GPIO. Часть 2. Device Tree overlays](https://devdotnet.org/post/rabota-s-gpio-na-primere-banana-pi-bpi-m64-chast-2-device-tree-overlays/ "Работа с GPIO. Часть 2. Device Tree overlays").

## Системные требования

- **Версия ОС.** Windows 7-10 (x64). Версия для Linux появится позже. Примечание: следующая версия расширения выше v0.3 не будет поддерживать Windows 7;
- **Visual Studio Code.** версия не ниже [1.70.3](https://code.visualstudio.com/ "1.70.3"). Это последняя версия VSCode с поддержкой Windows 7, подробнее об этом на [странице поддержки](https://code.visualstudio.com/docs/supporting/faq#_can-i-run-vs-code-on-windows-7 "Can I run VS Code on Windows 7?");
- **.NET.** Для компиляции проекта на C# требуется [.NET SDK](https://dotnet.microsoft.com/en-us/download/visual-studio-sdks ".NET SDK") в зависимости от используемой версии вашего проекта (для работы самого расширения не требуется);

Дополнительные расширения необходимые для разработки .NET приложений:

- [C# for Visual Studio Code (powered by OmniSharp)](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csharp "C# for Visual Studio Code (powered by OmniSharp)") — поддержка разработки на C#.

Рекомендуемые дополнительные расширения, улучшающие процесс разработки и взаимодействия с удаленным устройством:

- [NuGet Package Manager GUI](https://marketplace.visualstudio.com/items?itemName=aliasadidev.nugetpackagemanagergui "NuGet Package Manager GUI") — добавление Nuget-пакетов (позже менеджер Nuget-пакетов будет встроен в расширение);
- [DeviceTree](https://marketplace.visualstudio.com/items?itemName=plorefice.devicetree "DeviceTree") — поддержка синтаксиса для файлов дерева устройств (Device Tree, DT). Используется для редактирования файлов `*.dts`. Например, потребуется если возникнет необходимость адаптации [дисплея SPI LCD ILI9341](https://devdotnet.org/post/rabota-s-gpio-v-linux-na-primere-banana-pi-bpi-m64-chast-4-device-tree-overlays-podkluchenie-displey-spi-lcd-ili9341/ "дисплея SPI LCD ILI9341") для вашего одноплатного компьютера;
- [Output Colorizer](https://marketplace.visualstudio.com/items?itemName=IBM.output-colorizer "Output Colorizer") — добавляет цвет к тестовым сообщениям в окне OUTPUT, облегчает восприятие информации выдаваемой расширением.

## Системные требования для устройства

- **Процессор.** ARMv7 или ARMv8;
- **Версия ОС.** Linux дистрибутив построенный на основе Ubuntu версии не ниже 20.04 LTS (Focal Fossa), или на основе Debian версии не ниже 10.11 (Buster). Рекомендуется использовать дистрибутив [Armbian](https://www.armbian.com/ "Armbian – Linux for ARM development boards").

## Быстрый старт

Смотрите [Getting started](/docs/Getting-started_ru.md "Getting started").

## Настройки расширения

Смотрите [Extension settings](/docs/Extension-settings_ru.md "Extension settings").

## Устранение неполадок

Для устранения неполадок ознакомьтесь с инструкцией [Troubleshooting](docs/Troubleshooting_ru.md "Troubleshooting").

## Шаблоны проектов

Как создавать шаблоны посетите страницу [Project Templates](docs/Project-templates_ru.md "Project Templates").

## Дополнительные материалы

Для ознакомления с дополнительной документацией к проекту посетите страницу [Additional materials](docs/Additional-materials_ru.md "Additional materials").

## Список изменений

Смотрите [CHANGELOG](CHANGELOG_ru.md "CHANGELOG").

## Лицензия

Это программное обеспечение находится под лицензией LGPL-3.0.

Смотрите [LICENSE](LICENSE "LICENSE") для получения более подробной информации.

[Шаблоны проектов](/templates/ "Project Templates") к проектам распространяются под лицензией [MIT](LICENSE_MIT.md "MIT LICENSE").

## Обратная связь

Свои замечания отправляйте по email `fastiot@devdotnet.org`. И отмечайте в [Issues](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/issues "Issues").

## Дальнейший план

Смотрите [SCHEDULE](SCHEDULE_ru.md "SCHEDULE").

## Известные проблемы

Смотрите [ISSUES](ISSUES_ru.md "ISSUES") и [Issues on GitHub](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/issues "Issues on GitHub").

## Тестирование

Тестирование выполняется на следующих одноплатных компьютерах:

- [Cubieboard](https://github.com/devdotnetorg/Cubieboard "Cubieboard"). Дистрибутив Armbian.
- [Cubietruck](https://devdotnet.org/post/otladochnaya-plata-cubietruck/ "Cubietruck"). Дистрибутив Armbian.
- [Banana Pi BPI-M64](https://devdotnet.org/post/otladochnaya-plata-banana-pi-bpi-m64/ "Banana Pi BPI-M64"). Дистрибутив Armbian.
