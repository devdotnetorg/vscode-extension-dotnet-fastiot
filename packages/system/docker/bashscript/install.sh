#!/bin/bash
# Run: 
# chmod +x install.sh
# ./install.sh --username debugvscode
# package: docker

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: package/docker/install.sh"

# reading arguments from CLI
POSITIONAL_ARGS=()
while [[ $# -gt 0 ]]; do
  case $1 in
    -u|--username)
      USERNAME="$2"
      shift # past argument
      shift # past value
      ;;
    -*|--*)
      echo "Unknown option $1"
      exit 1
      ;;
    *)
      POSITIONAL_ARGS+=("$1") # save positional arg
      shift # past argument
      ;;
  esac
done

# check
if [ -z $USERNAME ]; then
	echo "Error: USERNAME not specified"
	exit 1;
fi

export DEBIAN_FRONTEND="noninteractive"

#Combining @ssokolow's last comment with the answer from here, this command will run apt-get update if it hasn't run in the last 1 days:
#https://askubuntu.com/questions/410247/how-to-know-last-time-apt-get-update-was-executed
[ -z "$(find -H /var/lib/apt/lists -maxdepth 0 -mtime -1)" ] && sudo apt-get update
sudo apt-get install -y curl

#install
curl https://get.docker.com | sudo bash
#removal of artifacts
if [ -f /etc/apt/sources.list.d/docker.list ]; then
	#rm
	sudo rm /etc/apt/sources.list.d/docker.list
fi

#granting rights to user debugvscode
sudo usermod -aG docker $USERNAME

#info
sudo systemctl status docker
docker --version

echo "Successfully"
