## Устранение неполадок

Содержание:

1. Устранение неполадок при добавлении устройства;
2. Проблемы с запуском/работой расширения;

Добавить траблшутинг
удаление всех настроек, папка профайлер,
C:\Users\User\AppData\Roaming\Code\User\settings.json
C:\Users\Anton\fastiot\settings\keys\
окно вывод сообщений
отладка шаблона
настройка ключей ssh, или целиком строка инициализации ключа
траблешутинг подключение по ssh пример как сейчас и где смотреть логи
удаление всех конфигов и очистка
последний скрипт на устройве
Exec command: chmod +x vscode-dotnetfastiot.sh && ./vscode-dotnetfastiot.sh
файл отладки json в каталоге проекта

В открывшемся редакторе задайте следующие параметры. Если данные параметры отсутствуют, то просто вставьте строку (обычно отсутствует параметр `AuthenticationMethods`):

```bash
PermitRootLogin yes
PasswordAuthentication yes
ChallengeResponseAuthentication yes
AuthenticationMethods publickey keyboard-interactive password
PubkeyAcceptedAlgorithms=+ssh-rsa
```
SSH-Server
apt-get remove openssh-server
cat /etc/ssh/sshd_config
rm /etc/ssh/sshd_config
cat /etc/ssh/sshd_config
sudo apt-get update
sudo apt-get upgrade
sudo dpkg --configure -a
mcedit /etc/ssh/sshd_config
sudo apt-get install -y openssh-server mc
---
!!!
!! ssh server key type ssh-rsa not in PubkeyAcceptedAlgorithms preauth
now rsa-sha2-256 заменить на Ed25519
Решение:
sudo mcedit /etc/ssh/sshd_config
Добавить строку
PubkeyAcceptedAlgorithms=+ssh-rsa
сохранить изменения и выполнить команду перезапуска ssh сервера
sudo systemctl reload ssh
sudo systemctl status ssh
В расширение необходимо удалить устройство и заново его добавить

Проверьте настройки ssh-server. В файле  /etc/ssh/sshd_config должны быть следующие параметры:
Check your ssh-server settings. The /etc/ssh/sshd_config file should contain the following options:
PermitRootLogin yes
PasswordAuthentication yes
ChallengeResponseAuthentication yes
AuthenticationMethods publickey keyboard-interactive password
PubkeyAcceptedAlgorithms=+ssh-rsa
После внесения настроек перезапустите ssh-server командой:
After making changes, restart ssh-server:
sudo systemctl reload ssh
Затем удалите устройство и снова его добавьте.
Then remove the device and add it again.
Если по прежнему не удалось подключиться, то выполните на устройстве команду для получения сведений о проблеме подключения по ssh-протоколу:
If you are still unable to connect, then run the following command on the device to get information about the connection problem using the ssh protocol:
sudo systemctl status ssh
