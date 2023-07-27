#!/bin/bash
# Run: 
# chmod +x checkpackagemono.sh
# ./checkpackagemono.sh

set -e #Exit immediately if a comman returns a non-zero status

#check
mono --version &>/dev/null || outstr="notinstalled"
if [ "$outstr" == "notinstalled" ]; then
	echo $outstr
	exit 0
fi

#is OK
#declare 
mono --version | grep "version" | sed 's/version/@/g' | cut -d '@' -f 2 | sed -e 's/^[[:space:]]*//'
