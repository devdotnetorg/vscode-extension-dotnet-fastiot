#!/bin/bash
# Run:
# chmod +x check.sh
# ./check.sh
# package: dotnet-vsdbg

set -e #Exit immediately if a comman returns a non-zero status

#json
#{"packages":[]}
declare JSON_STRING='{"packages":[]}'
declare JSON_RECORD=''

#check
vsdbg --help &>/dev/null || outstr="notinstalled"
if [ "$outstr" == "notinstalled" ]; then
	echo $JSON_STRING
	exit 0
fi

#is OK
#declare 

declare FULL_PATH_VSDBG=("$(readlink -f /usr/bin/vsdbg)") # /usr/share/vsdbg/vsdbg
declare DIR_VSDBG="$(dirname "${FULL_PATH_VSDBG}")" # "/usr/share/vsdbg
declare FILEVERSION_PATH_VSDBG="${DIR_VSDBG}/success.txt"
declare VERSION_VSDBG=("$(cat ${FILEVERSION_PATH_VSDBG})") # ubuntu, debian, alpine

JSON_STRING='{"packages":['

#json
JSON_RECORD=$( jq -n \
		  --arg version "${VERSION_VSDBG}" \
		  --arg edition "none" \
		  --arg dir "${DIR_VSDBG}" \
		  --arg tag "none" \
		  '{version: $version, edition: $edition, dir: $dir, tag: $tag}' )
JSON_STRING=$(echo "${JSON_STRING}${JSON_RECORD},")

#end
JSON_STRING=$(echo "${JSON_STRING}]}")

#output
#{
#	"packages": [
#		{
#			"version": "17.12.10904.2",
#			"edition": "none",
#			"dir": "/usr/share/vsdbg",
#			"tag": "none"
#		}
#	]
#}

echo $JSON_STRING

exit 0
