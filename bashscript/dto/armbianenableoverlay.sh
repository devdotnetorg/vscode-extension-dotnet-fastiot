#!/bin/bash
# Run: 
# chmod +x armbianenableoverlay.sh
# ./armbianenableoverlay.sh led-blue-disabled

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: armbianenableoverlay.sh"

#
ADD_OVERLAY="$1"
filename="/boot/armbianEnv.txt"
thekey="overlays"

#
if [ -z $ADD_OVERLAY ]; then
	echo "Error: OVERLAY not specified"
	exit 1;
fi

#Add overlay in file /boot/armbianEnv.txt, overlays=
#read current value
declare value="$(cat $filename | grep $thekey | sed 's/.*=\s*//')"
echo "OLD Value = $value"

#new value
if [ ${#value} -ge 1 ]; then declare newvalue="${value} ${ADD_OVERLAY}" ;
else declare newvalue="${ADD_OVERLAY}"
fi

echo "NEW Value = $newvalue"

#record new value
if ! grep -R "^[#]*\s*${thekey}=.*" $filename > /dev/null; then
  echo "APPENDING because '${thekey}' not found"
  #newline
  sudo sh -c "echo '\n' >> $filename"  
  #
  sudo sh -c "echo "$thekey=$newvalue" >> $filename"
else
  echo "SETTING because '${thekey}' found already"
  sudo sed -ir "s/^[#]*\s*${thekey}=.*/$thekey=$newvalue/" $filename
  #newline
  sudo sh -c "echo '\n' >> $filename"
fi

#delete empty lines
sudo sed -ir '/^[[:space:]]*$/d' $filename

echo "Successfully"
