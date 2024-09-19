#!/bin/bash
# Run:
# chmod +x check.sh
# ./check.sh
# package: docker

set -e #Exit immediately if a comman returns a non-zero status

#json
#{"packages":[]}
declare JSON_STRING='{"packages":[]}'
declare JSON_RECORD=''

#check
docker --version &>/dev/null || outstr="notinstalled"
if [ "$outstr" == "notinstalled" ]; then
	echo $JSON_STRING
	exit 0
fi

#is OK
#declare 
declare listdata=($(docker --version))

JSON_STRING='{"packages":['

DOCKERVERSION="${listdata[2]}"
#Delete the last character of a string
DOCKERVERSION="${DOCKERVERSION::-1}"

#json
JSON_RECORD=$( jq -n \
		  --arg version "${DOCKERVERSION}" \
		  --arg edition "none" \
		  --arg dir "none" \
		  --arg tag "${listdata[4]}" \
		  '{version: $version, edition: $edition, dir: $dir, tag: $tag}' )
JSON_STRING=$(echo "${JSON_STRING}${JSON_RECORD}")

#end
JSON_STRING=$(echo "${JSON_STRING}]}")

#output
#{
#	"packages": [
#		{
#			"version": "27.2.1",
#			"edition": "none",
#			"dir": "none",
#			"tag": "9e34c9b"
#		}
#	]
#}

echo $JSON_STRING

exit 0
