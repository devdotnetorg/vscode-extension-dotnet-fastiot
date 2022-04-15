#!/bin/bash
# Run: 
# chmod +x gpioinfotojson.sh
# ./gpioinfotojson.sh 0

set -e #Exit immediately if a comman returns a non-zero status

#
ID_GPIOCHIP="$1"
#

if [ -z $ID_GPIOCHIP ]; then
	echo "Error: ID_GPIOCHIP not specified"
	exit 1;
fi

#run

(echo "id name consumer direction state used mode" && (gpioinfo $ID_GPIOCHIP | sed '1d' | sed 's/^[ \t]*//g' | sed 's/[ \t]*$//g' | sed 's/  / /g' | sed 's/  / /g'| sed 's/  / /g' | sed 's/line//g' | tr -d '[]' | sed 's/^ *//')) | jq -Rn 'input  | split(" ") as $head | [ inputs | split(" ") | to_entries | map(.key = $head[.key]) | [ .[:7][] ] | from_entries]'
