#!/bin/bash
# Run: 
# chmod +x checkpackagelibgpiod.sh
# ./checkpackagelibgpiod.sh

set -e #Exit immediately if a comman returns a non-zero status

#check
gpiodetect --version &>/dev/null || outstr="notinstalled"
if [ "$outstr" == "notinstalled" ]; then
	echo $outstr
	exit 0
fi

#is OK
#declare 
declare listdata=($(gpiodetect --version))

#echo "My array: ${listdata[@]}"
#echo "Number of elements in the array: ${#listdata[@]}"

echo "${listdata[2]} [/usr/share/libgpiod]"	 
