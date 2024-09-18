#!/bin/bash
# Run: 
# chmod +x check.sh
# ./check.sh

set -e #Exit immediately if a comman returns a non-zero status

#json
#{"packages":[]}
declare JSON_STRING='{"packages":[]}'
declare JSON_RECORD=''

#check
dotnet --list-runtimes &>/dev/null || outstr="notinstalled"
if [ "$outstr" == "notinstalled" ]; then
	echo $JSON_STRING
	exit 0
fi
#is OK
#declare 
declare listdata=($(dotnet --list-runtimes))

#echo "My array: ${listdata[@]}"
#echo "Number of elements in the array: ${#listdata[@]}"

JSON_STRING='{"packages":['

for (( i=0; i<=(${#listdata[@]}-3); i=i+3)); do
     #echo "${listdata[i+1]} ${listdata[i]} ${listdata[i+2]}"
	 installdir="${listdata[i+2]}"
	 #Remove first character of a string
	 installdir="${installdir:1}"
	 #Delete the last character of a string
	 installdir="${installdir::-1}"

     #json
     JSON_RECORD=$( jq -n \
                  --arg version "${listdata[i+1]}" \
                  --arg edition "${listdata[i]}" \
                  --arg installdir "${installdir}" \
                  '{version: $version, edition: $edition, installdir: $installdir}' )
     JSON_STRING=$(echo "${JSON_STRING}${JSON_RECORD},")
	 #echo "${JSON_RECORD}"

done

#Delete the last character of a string
JSON_STRING="${JSON_STRING::-1}"

JSON_STRING=$(echo "${JSON_STRING}]}")

echo $JSON_STRING

exit 0
