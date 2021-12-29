#!/bin/bash
# Run: 
# chmod +x checkpackagedotnetsdk.sh
# ./checkpackagedotnetsdk.sh

set -e #Exit immediately if a comman returns a non-zero status

#check
dotnet --list-sdks &>/dev/null || outstr="notinstalled"
if [ "$outstr" == "notinstalled" ]; then
	echo $outstr
	exit 0
fi
#is OK

dotnet --list-sdks
