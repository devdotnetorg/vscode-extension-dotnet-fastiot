#!/bin/bash
# Run: 
# chmod +x uninstallpackagemono.sh
# ./uninstallpackagemono.sh

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: uninstallpackagemono.sh"

export DEBIAN_FRONTEND="noninteractive"

#
sudo dpkg -l | grep -i mono-complete
sudo apt-get purge -y mono-complete
sudo apt-get autoremove -y --purge mono-complete
#

#file exist $filename
declare filename="/etc/apt/sources.list.d/mono-official-stable.list"

#removal
if [ -f $filename ]; then
	#rm
	sudo rm $filename
fi
#

echo "Successfully"
