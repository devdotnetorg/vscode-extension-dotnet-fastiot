#!/bin/bash
# Run: 
# chmod +x gpiodetecttojson.sh
# ./gpiodetecttojson.sh

#set -e #Exit immediately if a comman returns a non-zero status

export DEBIAN_FRONTEND="noninteractive"

#need jq sqlite3
I=`dpkg -s jq | grep "Status"` #проверяем состояние пакета (dpkg) и ищем в выводе его статус (grep)
if [ -n "$I" ] #проверяем что нашли строку со статусом (что строка не пуста)
then
	echo "installed" &>/dev/null #выводим результат
else
	#echo " not installed"
	sudo apt-get update &>/dev/null
	sudo apt-get install -y jq &>/dev/null
fi

#
set -e #Exit immediately if a comman returns a non-zero status

#run
echo "[$((echo "id description numberlines" && gpiodetect) | jq -Rn 'input  | split(" ") as $head | [ inputs | split(" ") | to_entries | map(.key = $head[.key]) | [ .[:3][] ] | from_entries]' | tr -d '()[]' | sed 's/gpiochip//g')]"
