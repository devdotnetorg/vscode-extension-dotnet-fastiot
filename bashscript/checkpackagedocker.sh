#!/bin/bash
# Run: 
# chmod +x checkpackagedocker.sh
# ./checkpackagedocker.sh

set -e #Exit immediately if a comman returns a non-zero status

#check
docker --version &>/dev/null || outstr="notinstalled"
if [ "$outstr" == "notinstalled" ]; then
	echo $outstr
	exit 0
fi

#is OK
#declare 
declare listdata=($(docker --version))

#echo "My array: ${listdata[@]}"
#echo "Number of elements in the array: ${#listdata[@]}"

echo "${listdata[2]} ${listdata[3]} ${listdata[4]}"	 
