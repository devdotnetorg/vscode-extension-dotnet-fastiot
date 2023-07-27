#!/bin/bash
#Test
# Run: sudo ./test.sh AABBCC

set -e
#
TEXT_A="$1"

if [ -z $TEXT_A ]; then
	echo "Error: no text"
	exit;
fi
 
#
mkdir $TEXT_A-$(date +"%H-%M_%d-%b-%y")
