#!/bin/bash
#Test
# chmod +x test4.sh
# Run: sudo ./test4.sh firefox

set -e
#
IN="$1"

if [ $(dpkg-query -W -f='${Status}\n' firefox | head -n1 | awk '{print $3;}' | grep -q '^installed$') -eq 0 ];
then
  apt-get update;
fi