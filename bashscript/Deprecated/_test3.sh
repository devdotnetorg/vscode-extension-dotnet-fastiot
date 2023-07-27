#!/bin/bash
#Test
# Run: sudo ./test3.sh AAA;BBB 

set -e
#
IN="$1"

#Split the string based on the delimiter, ':'
readarray -d ; -t strarr <<< "$IN"
printf "\n"

# Print each value of the array by using loop
for (( n=0; n < ${#strarr[*]}; n++))
do
  echo "${strarr[n]}"
done