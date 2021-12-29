#!/bin/bash
# Run: 
# chmod +x checkpackagedotnetruntimes.sh
# ./checkpackagedotnetruntimes.sh

set -e #Exit immediately if a comman returns a non-zero status

#check
dotnet --list-runtimes &>/dev/null || outstr="notinstalled"
if [ "$outstr" == "notinstalled" ]; then
	echo $outstr
	exit 0
fi
#is OK
#declare 
declare listdata=($(dotnet --list-runtimes))

#echo "My array: ${listdata[@]}"
#echo "Number of elements in the array: ${#listdata[@]}"

for (( i=0; i<=${#listdata[@]}; i=i+3)); do
     echo "${listdata[i+1]} ${listdata[i]} ${listdata[i+2]}"	 
done
