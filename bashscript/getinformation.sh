#!/bin/bash
# Run: 
# chmod +x getinformation.sh
# ./getinformation.sh

set -e #Exit immediately if a comman returns a non-zero status

#read info

echo "hostname:$(uname -n)"
echo "architecture:$(uname -m)"
echo "osKernel:$(uname -r)"
echo "osName:$(lsb_release -i | sed 's/.*:\s*//')"
echo "osDescription:$(lsb_release -d | sed 's/.*:\s*//')"
echo "osRelease:$(lsb_release -r | sed 's/.*:\s*//')"
echo "osCodename:$(lsb_release -c | sed 's/.*:\s*//')"

if [ -f /etc/armbian-release ]; then
	#cat /etc/armbian-release | grep 'BOARD_NAME\|BOARDFAMILY\|VERSION\|LINUXFAMILY'
	echo "boardName:$(cat /etc/armbian-release | grep 'BOARD_NAME' | sed 's/.*=\s*//')"
	echo "boardFamily:$(cat /etc/armbian-release | grep 'BOARDFAMILY' | sed 's/.*=\s*//')"
	echo "armbianVersion:$(cat /etc/armbian-release | grep 'VERSION' | sed 's/.*=\s*//')"
	echo "linuxFamily:$(cat /etc/armbian-release | grep 'LINUXFAMILY' | sed 's/.*=\s*//')"
else
	#/proc/cpuinfo	
	declare boardName=($(cat /proc/cpuinfo | grep 'model\|Model' | sed 's/.*:\s*//'))	
	if [ "$boardName" != "" ]; then
		echo "boardName:${boardName}"
	fi	
fi
