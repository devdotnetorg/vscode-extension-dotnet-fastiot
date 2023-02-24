#!/bin/bash
# Run: 
# chmod +x installpackagemono.sh
# ./installpackagemono.sh

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: installpackagemono.sh"

export DEBIAN_FRONTEND="noninteractive"

#Add the Mono repository to your system
#--------------------------------------

#file exist $filename
declare filename="/etc/apt/sources.list.d/mono-official-stable.list"

#removal
if [ -f $filename ]; then
	#rm
	sudo rm $filename
fi

#get OS name: Ubuntu Debian Raspbian
declare osName=$(lsb_release -i | sed 's/.*:\s*//')
echo "osName: $osName"

#get OS codename: focal bionic buster stretch
declare osCodename=("$(lsb_release -c | sed 's/.*:\s*//')")	
echo "osCodename: $osCodename"

#select repository

if [[ "$osName" == "Ubuntu" || "$osName" == "Debian" || "$osName" == "Raspbian" ]]; then
    #Update
	sudo apt-get update
	sudo apt-get install -y apt-transport-https dirmngr gnupg ca-certificates
	sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF
	#
	if [[ "$osName" == "Raspbian" ]]; then
		#Raspbian
		echo "Raspbian"
		case $osCodename in
			buster)
				echo "buster"				
				echo "deb https://download.mono-project.com/repo/debian stable-raspbianbuster main" | sudo tee $filename
				;;
			stretch)
				echo "stretch"				
				echo "deb https://download.mono-project.com/repo/debian stable-raspbianstretch main" | sudo tee $filename
				;;
			*)
				echo "Error: your operating system is not supported to install the Mono package."
				exit 1          
				;;
		esac		
	else		
		#Ubuntu Debian
		echo "Ubuntu or Debian"
		case $osCodename in
			#Ubuntu
			jammy)
				echo "focal"
				echo "deb https://download.mono-project.com/repo/ubuntu stable-focal main" | sudo tee $filename
				;;			
			focal)
				echo "focal"
				echo "deb https://download.mono-project.com/repo/ubuntu stable-focal main" | sudo tee $filename
				;;
			bionic)
				echo "bionic"
				echo "deb https://download.mono-project.com/repo/ubuntu stable-bionic main" | sudo tee $filename
				;;
			xenial)
				echo "xenial"
				echo "deb https://download.mono-project.com/repo/ubuntu stable-xenial main" | sudo tee $filename
				;;
			#Debian
			buster)
				echo "buster"
				echo "deb https://download.mono-project.com/repo/debian stable-buster main" | sudo tee $filename
				;;
			stretch)
				echo "stretch"
				echo "deb https://download.mono-project.com/repo/debian stable-stretch main" | sudo tee $filename
				;;			
			*)
				echo "Error: your operating system is not supported to install the Mono package."
				exit 1          
				;;
		esac
	fi	
else
    echo "Error: your operating system is not supported to install the Mono package."
	exit 1
fi

#Update
sudo apt-get update

#Install Mono
#------------
sudo apt-get install -y mono-complete

#Check Mono
#------------
mono --version

echo "Successfully"
