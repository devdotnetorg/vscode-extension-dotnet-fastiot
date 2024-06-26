# Список изменений

## v0.4.2 (29-05-2024)

- Исправлены ошибки в пакетах.

## v0.4.1 (27-05-2024)

- Добавлены шаблоны для RISC-V устройств.
- Обновлен пакет Libgpiod.
- Исправлены ошибки.

## v0.4.0 (30-05-2023)

- Добавлена команда обнаружения устройств в локальной сети.
- Обновлены npm-пакеты компонентов.
- Улучшен UI.

## v0.3.4 (17-05-2023)

- Исправлены ошибки.

## v0.3.3 (28-04-2023)

- Добавлен параметр `fastiot.template.community.updatesource`, источник обновления для community шаблонов проектов. Добавляет возможность загружать шаблоны со сторонних ресурсов.
- Добавлен по умолчанию выбор папки "Projects" для размещения проектов, параметр `fastiot.template.defaultprojectfolder`.
- Добавлена поддержка .NET Runtime и SDK 8.0.
- Выключается телеметрия в CLI .NET на устройстве.
- Добавлено автоматическое добавление ключей `fastiotIdLaunch`, `fastiotIdDevice`, `fastiotProject`, `fastiotIdTemplate`, для  Launch, если они отсутствуют в шаблоне. Т.е. теперь эти поля для шаблона являются необязательными.
- Добавлен параметр `fastiot.loglevel`, уровень журналирования. Значение по умолчанию - `Information`, выводит только основные события, значение `Debug` - выводит подробную информацию о событиях.
- Добавлен параметр `fastiot.debug`, отладка. Предназначен для отладки сущностей, таких как шаблоны. При включенном значении сохраняет дополнительную отладочную информацию.
- Добавлен выбор алгоритма шифрования ключа для устройства из списка, вместо ввода значений, параметр `fastiot.device.ssh.keytype`. Дополнительно доступны пользовательские произвольные значения.
- Добавлены опции выбора в Launch.
- Добавлена команда запуска SSH терминала в окне TERMINAL.
- Добавлены команды и горячие клавиши для запуска расширения.
- Добавлена функция FileSystemWatcher для отслеживания изменений Launch вне работы расширения.
- Добавлены кнопки создания проекта на Welcome Panel.
- Улучшен UI.

## v0.3.2 (24-03-2023)

- Добавлен вывод диагностической информации при подключении по ssh-протоколу.
- По окончанию выполнения ssh-скриптов добавлен вывод stdErr и codeErr.
- Решена проблема долгого выполнения скриптов при добавлении устройства.
- Добавлен параметр `fastiot.template.loadonstart`, можно отключить загрузку шаблонов при старте расширения.
- Добавлен параметр `fastiot.template.updateinterval`, интервал времени между обновлениями шаблонов.
- Добавлен параметр `fastiot.template.isupdate`, отключает обновление шаблонов.
- Добавлена команда `Restore/upgrade system templates` для восстановления системных шаблонов.
- Для шаблонов проектов добавлены переменные: `%{extension.apps.builtin.aswindows}`, `%{os.userinfo.username}`.
- Выполнено соответствие с UX Guidelines.
- Улучшен UI.
- Изменено описание настроек.
- Добавлена Crlf нормализация для bash-скриптов.
- Исправлены ошибки.

## v0.3.1 (27-02-2023)

- Исправлены ошибки.

## v0.3.0 (24-02-2023)

- Добавлена поддержка использования шаблонов для проектов, включая пользовательские.
- Добавлена загрузка/обновление шаблонов для проектов с внешних ресурсов. Пока обновляются только системные шаблоны.
- Добавлена поддержка нескольких Launch для шаблонов проектов с пересекающимися tasks, т.е. в случае удаления одного из Launch, используемые tasks в других Launch не будут удалены.
- Автоматически конфигурируется файл настроек `sshd_config` OpenSSH сервера, теперь для старта необходимо задать только два параметра "PermitRootLogin yes" и "PasswordAuthentication yes".
- Ресурсы расширения, такие как ключи к устройствам, шаблоны, теперь хранятся по умолчанию в домашней папке, например `C:\Users\Anton\fastiot`.
- Добавлены настройки алгоритма ключа для ssh авторизации. Можно указать тип алгоритма (по умолчанию ed25519) и длину ключа (по умолчанию 256).
- Добавлено детальное описание решение проблемы в случае невозможности подключения к устройству. Проверяется отдельно доступность по: ip-адресу, порту, ssh-протоколу.
- Добавлен пакет Mono (experimental).
- Исправлены ошибки: загрузка бинарного файла DTO, сохранение конфигурации Gpiochips и DTO, импорт конфигурации устройств.
- Некоторые визуальные изменения.

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
