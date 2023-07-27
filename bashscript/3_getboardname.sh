#!/bin/bash
# Run: 
# chmod +x 3_getboardname.sh
# ./3_getboardname.sh

set -e #Exit immediately if a comman returns a non-zero status

# definition of variables
declare boardname=""
#

#Armbian
if [ -f /etc/armbian-release ]; then
	declare boardname="$(cat /etc/armbian-release | grep '^BOARD_NAME=' | sed 's/.*=\s*//')"
fi

#Raspberry Pi
if [ "$boardname" == "" ]; then
	#/proc/cpuinfo
	#/root/rpiz.txt
	#TODO: заменить велосипед на более простой
	declare raspberrypi=("$(cat /proc/cpuinfo | grep '^Model\|^model' | grep -v 'name' | sed 's/.*:\s*//' | head -n1)")
	if [ "$raspberrypi" != "" ]; then
		#string must be longer than 2 characters
		if [ ${#raspberrypi} -gt 2 ]; then
			# ok
			boardname=raspberrypi
		fi
	fi
fi

#x86_64
if [ "$boardname" == "" ]; then
	declare boardname=("$(cat /proc/cpuinfo | grep '^model name' | sed 's/.*:\s*//' | sed '1q')")
fi	

#json
declare JSON_STRING=$( jq -n \
                  --arg boardname "$boardname" \
                  '{boardname: $boardname}' )

echo $JSON_STRING
