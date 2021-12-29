#!/bin/bash
#Test
# Run: sudo ./test.sh AABBCC

#

rm qwe
status=$?

if test $status -eq 0
then
	echo "OK. status= '$status'"
	exit
else
	echo "ERROR. status= '$status'"
fi

echo "Ok"
