[![License](https://img.shields.io/badge/License-LGPL3.0-blue.svg)](LICENSE) ![GitHub last commit](https://img.shields.io/github/last-commit/devdotnetorg/vscode-extension-dotnet-fastiot) [![Visual Studio Marketplace](https://img.shields.io/vscode-marketplace/d/devdotnetorg.vscode-extension-dotnet-fastiot.svg)](https://marketplace.visualstudio.com/items?itemName=devdotnetorg.vscode-extension-dotnet-fastiot)

# .NET FastIoT VS Code Extension

Расширение [.NET FastIoT](https://marketplace.visualstudio.com/items?itemName=devdotnetorg.vscode-extension-dotnet-fastiot ".NET FastIoT Extension") в Visual Studio Code Marketplace.

[README](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/blob/master/README.md "README") in English | [README](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/blob/master/README_ru.md "README") на русском языке | Habr.com (Russian) - [Easy development of IoT applications in C # for Raspberry Pi and other SBCs, on Linux](https://habr.com/ru/company/timeweb/blog/597601/ "Easy development of IoT applications in C # for Raspberry Pi and other SBCs, on Linux").

Расширение настраивает встраиваемое устройство на архитектуре ARMv7 или ARMv8, работающее под Linux, для запуска .NET приложений, и конфигурирует проекты `*.csproj` для удаленной отладки по ssh-туннелю. Работает только на Windows (64 бит).

*Интерфейс расширения .NET FastIoT*

![.NET FastIoT title](https://raw.githubusercontent.com/devdotnetorg/vscode-extension-dotnet-fastiot/master/docs/vscode-dotnet-fastiot.png)

![.NET FastIoT title](https://raw.githubusercontent.com/devdotnetorg/vscode-extension-dotnet-fastiot/master/docs/vscode-dotnet-fastiot-interface_ru.png)

## Возможности

1. Простая установка .NET SDK, .NET Runtimes, .NET Debugger (vsdbg), Libgpiod, Docker для Linux;
2. Настройка проектов .NET для удаленной отладки, добавление переменных окружения (метод [Environment.GetEnvironmentVariable](https://docs.microsoft.com/en-us/dotnet/api/system.environment.getenvironmentvariable "Environment.GetEnvironmentVariable"));
3. Управление файлами наложения устройств (Device Tree overlays). Требуется для включения/выключения таких устройства как I2C, SPI, PWM, и т. д. Доступна удаленная загрузка файлов `*.DTS` и включение/выключение «слоев». Более подробно в публикации [Работа с GPIO. Часть 2. Device Tree overlays](https://devdotnet.org/post/rabota-s-gpio-na-primere-banana-pi-bpi-m64-chast-2-device-tree-overlays/ "Работа с GPIO. Часть 2. Device Tree overlays"). Поддерживается только дистрибутив [Armbian](https://devdotnet.org/post/armbian-linux-distributiv-dlya-otladochnyh-plat-na-arm/ "Armbian"). Для поддержки других дистрибутивов необходима реализация адаптера по интерфейсу [IDtoAdapter.ts](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/blob/master/src/DTO/IDtoAdapter.ts "IDtoAdapter.ts"). Пример реализации для Armbian — [IoTDTOArmbianAdapter.ts](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/blob/master/src/DTO/IoTDTOArmbianAdapter.ts "IoTDTOArmbianAdapter.ts");
4. Управление контактами GPIO (пока полностью не реализовано). Обнаружение доступных Gpiochip ~~и линий. Подача `0/1` на контакт, считывание состояния контакта. Формирование C# кода под выбранный контакт для переноса в проект один-к-одному.~~

## Системные требования

- **Версия ОС.** Windows 7-10 (x64). Версия для Linux появится позже;
- **Visual Studio Code.** версия не ниже [1.63](https://code.visualstudio.com/ "1.63");
- **.NET.** Для компиляции проекта на C# требуется [.NET SDK](https://dotnet.microsoft.com/en-us/download/visual-studio-sdks ".NET SDK") в зависимости от используемой версии вашего проекта (для работы самого расширения не требуется);

Дополнительные расширения необходимые для разработки .NET приложений:

- [C# for Visual Studio Code (powered by OmniSharp)](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csharp "C# for Visual Studio Code (powered by OmniSharp)") — поддержка разработки на C#;
- [NuGet Package Manager](https://marketplace.visualstudio.com/items?itemName=jmrog.vscode-nuget-package-manager "NuGet Package Manager") — добавление Nuget-пакетов (позже менеджер Nuget-пакетов будет встроен в расширение);
- [DeviceTree](https://marketplace.visualstudio.com/items?itemName=plorefice.devicetree "DeviceTree") (опционально) — поддержка синтаксиса для файлов дерева устройств (Device Tree, DT). Используется для редактирования файлов `*.dts`. Например, потребуется если возникнет необходимость адаптации [дисплея SPI LCD ILI9341](https://devdotnet.org/post/rabota-s-gpio-v-linux-na-primere-banana-pi-bpi-m64-chast-4-device-tree-overlays-podkluchenie-displey-spi-lcd-ili9341/ "дисплея SPI LCD ILI9341") для вашего одноплатного компьютера.

Сторонние приложения:

- **cwRsync.** Из пакета используются утилиты rsync и ssh. Входит в состав расширения и копируется в папку по умолчанию `C:\RemoteCode\cwrsync\ ` (расположение изменяется в настройках). По желанию можете заменить пакет, загрузив с официального сайта по [ссылке](https://itefix.net/cwrsync "ссылке"). Терминал [PuTTY](https://www.putty.org/ "PuTTY") не используется.

Сторонние bash-скрипты для установки пакетов/библиотек:

- [.NET SDK](https://dot.net/v1/dotnet-install.sh ".NET SDK"), [.NET Runtimes](https://dot.net/v1/dotnet-install.sh ".NET Runtimes"), [.NET Debugger (vsdbg)](https://aka.ms/getvsdbgsh ".NET Debugger (vsdbg)"), Libgpiod, [Docker](https://get.docker.com/ "Docker"), загружаются с официальных сайтов разработчиков пакетов, за исключением библиотеки Libgpiod. Скрипт для установки данной библиотеки загружается с ресурса GitHub — [devdotnetorg/docker-libgpiod](https://raw.githubusercontent.com/devdotnetorg/docker-libgpiod/master/setup-libgpiod.sh "devdotnetorg/docker-libgpiod"). Далее, загруженный скрипт скачивает исходный текст библиотеки с официального репозитория [Libgpiod](https://git.kernel.org/pub/scm/libs/libgpiod/libgpiod.git/ "Libgpiod") и выполняется компиляция библиотеки.

## Быстрый старт

### Шаг 1 — Подготовка устройства

Одноплатный компьютер должен работать под управлением дистрибутива Debian или Ubuntu, Linux. Для удаленного доступа необходимо установить ssh-сервер и задать определенные настройки. В качестве терминала для удаленного доступа можно использовать [MobaXterm](https://mobaxterm.mobatek.net/download.html "MobaXterm") (существенно удобнее по сравнению с PuTTY терминалом). Если пакет `sudo` не установлен, то установите данный пакет от имени пользователя `root`, с помощью команд:

```bash
apt-get update
apt-get install -y sudo
```

Для установки ssh-сервера и настройки доступа выполните следующие команды на одноплатном компьютере:

```bash
sudo apt-get update
sudo apt-get install -y openssh-server mc
sudo systemctl reload ssh
sudo mcedit /etc/ssh/sshd_config
```

В открывшемся редакторе задайте следующие параметры. Если данные параметры отсутствуют, то просто вставьте строку (обычно отсутствует параметр `AuthenticationMethods`):

```bash
PermitRootLogin yes
PasswordAuthentication yes
ChallengeResponseAuthentication yes
AuthenticationMethods publickey keyboard-interactive password
```

Затем сохраните изменения <kbd>F2</kbd> и выйдите  из редактора <kbd>F10</kbd>.

Перезапустите ssh-сервер для применения новых настроек:

```bash
sudo systemctl reload ssh
sudo systemctl status ssh
```

Последняя команда выводит текущий статус службы.

Видео-инструкция настройки ssh-сервера для подключения расширения:

[![.NET FastIoT. Step 1. Configuring SSH access](https://img.youtube.com/vi/-xgAP1qsVsw/0.jpg)](https://www.youtube.com/watch?v=-xgAP1qsVsw)

### Шаг 2 — Добавление устройства

При первом подключение создается пара ключей доступа, приватный и публичный. Приватный ключ копируется в папку `C:\RemoteCode\keys\ ` (расположение изменяется в настройках). Данный ключ используется для конфигурирования устройства и запуска удаленной отладки.

Важный момент заключается в выборе учетной записи для создания на устройстве. Первый вариант это учетная запись **debugvscode** (название можно изменить в настройках), второй вариант это **root**:

*Выбор учетной записи для создания на устройстве*
![VSCode dotnet FastIoT](https://raw.githubusercontent.com/devdotnetorg/vscode-extension-dotnet-fastiot/master/docs/vscode-dotnet-fastiot-select-account.png)

При выборе варианта **debugvscode** создаетcя файл настройки прав доступа [20-gpio-fastiot.rules](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/blob/master/vscodetemplates/20-gpio-fastiot.rules "20-gpio-fastiot.rules") к устройствам используя подсистему [udev](https://ru.wikipedia.org/wiki/Udev "udev"). Создается группа с названием **iot**, и выдаются права на устройства, такие как: gpiochip, I2C, SPI, PWM, и т. д. Затем в эту группу добавляется пользователь **debugvscode**. В связи с тем, что тестирование выполнялось только на Armbian, возможно не все права доступа были добавлены. Поэтому, если возникнут проблемы с правами доступа к устройствам, то выбирайте — **root**.

*Добавление нового устройства ([YouTube](https://youtu.be/pusO7PV4NL4 "YouTube")):*

![VSCode dotnet FastIoT](https://raw.githubusercontent.com/devdotnetorg/vscode-extension-dotnet-fastiot/master/docs/2_Adding_a_device.gif)

### Шаг 3 — Установка пакетов

Для запуска .NET IoT приложения и выполнения удаленной отладки необходимо установить:

- Среду исполнения - .NET Runtime.
- Удаленный отладчик - .NET Debugger (vsdbg).
- Библиотеку управления линиями GPIO - Libgpiod (опционально).

Установка библиотеки Libgpiod возможно из репозитория и исходного текста. Если в репозитории размещена старая версия библиотеки, то тогда устанавливайте библиотеку из исходного текста.

### Шаг 4 — Конфигурация запуска

Теперь необходимо открыть проект или его создать. Пример проекта [dotnet-iot-fastiot-test](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/tree/master/Samples/dotnet-iot-fastiot-test "dotnet-iot-fastiot-test").

Для создание конфигурации удаленной отладки на устройстве, необходимо нажать на кнопку *Add Configuration*:

![VSCode dotnet FastIoT](https://raw.githubusercontent.com/devdotnetorg/vscode-extension-dotnet-fastiot/master/docs/vscode-dotnet-fastiot-create-launch-1.png)

Выбрать проект:

![VSCode dotnet FastIoT](https://raw.githubusercontent.com/devdotnetorg/vscode-extension-dotnet-fastiot/master/docs/vscode-dotnet-fastiot-create-launch-2.png)

Выбрать устройство для удаленной отладки:

![VSCode dotnet FastIoT](https://raw.githubusercontent.com/devdotnetorg/vscode-extension-dotnet-fastiot/master/docs/vscode-dotnet-fastiot-create-launch-3.png)

Создана конфигурация запуска приложения.

![VSCode dotnet FastIoT](https://raw.githubusercontent.com/devdotnetorg/vscode-extension-dotnet-fastiot/master/docs/vscode-dotnet-fastiot-create-launch-4.png)

Теперь необходимо перейти в `Run and Debug`:

![VSCode dotnet FastIoT](https://raw.githubusercontent.com/devdotnetorg/vscode-extension-dotnet-fastiot/master/docs/vscode-dotnet-fastiot-create-launch-5.png)

Выбрать конфигурацию для запуска:

![VSCode dotnet FastIoT](https://raw.githubusercontent.com/devdotnetorg/vscode-extension-dotnet-fastiot/master/docs/vscode-dotnet-fastiot-create-launch-6.png)

Запустить проект на отладку меню `Run > Start Debugging`.

![VSCode dotnet FastIoT](https://raw.githubusercontent.com/devdotnetorg/vscode-extension-dotnet-fastiot/master/docs/vscode-dotnet-fastiot-create-launch-7.png)

## Ролики (YouTube):

1. [Step 1. Configuring SSH access](https://www.youtube.com/watch?v=-xgAP1qsVsw "Step 1. Configuring SSH access")
2. [Step 2. Adding a device](https://www.youtube.com/watch?v=pusO7PV4NL4 "Step 2. Adding a device")
3. [Step 3. Installing packages](https://www.youtube.com/watch?v=Y8U2V0THQh4 "Step 3. Installing packages")
4. [Step 4. Creating a .NET console application and remote debugging](https://www.youtube.com/watch?v=oghH3oHIZgE "Step 4. Creating a .NET console application and remote debugging")
5. [Step 5. Using GPIO. Blink](https://www.youtube.com/watch?v=NQTgP4jwZPg "Step 5. Using GPIO. Blink")

## Известные проблемы

Смотрите [ISSUES.md](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/blob/master/ISSUES_ru.md "ISSUES.md") и [Issues](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/issues "Issues").

## Обратная связь

Свои замечания отправляйте по email `fastiot@devdotnet.org`. И отмечайте в [Issues](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/issues "Issues").

## Лицензия

Это программное обеспечение находится под лицензией LGPL-3.0.

Смотрите [LICENSE](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/blob/master/LICENSE "LICENSE") для получения более подробной информации.

## Changelog

Смотрите [CHANGELOG.md](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/blob/master/CHANGELOG_ru.md "CHANGELOG.md").

## Дальнейший план

Смотрите [SCHEDULE.md](https://github.com/devdotnetorg/vscode-extension-dotnet-fastiot/blob/master/SCHEDULE_ru.md "SCHEDULE.md").

## Тестирование

Тестирование выполнялось на одноплатных компьютерах:

- [Cubieboard](https://github.com/devdotnetorg/Cubieboard "Cubieboard")
- [Cubietruck](https://devdotnet.org/post/otladochnaya-plata-cubietruck/ "Cubietruck")
- [Banana Pi BPI-M64](https://devdotnet.org/post/otladochnaya-plata-banana-pi-bpi-m64/ "Banana Pi BPI-M64")
