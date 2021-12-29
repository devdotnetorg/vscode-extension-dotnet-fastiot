#!/bin/bash
# Run: 
# chmod +x createaccount.sh
# ./createaccount.sh debugvscode sudo

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: createaccount.sh"

#
NEWUSERNAME="$1"
GROUPUSER="$2"

#
if [ -z $NEWUSERNAME ]; then
	echo "Error: NEWUSERNAME not specified"
	exit 1;
fi

if [ -z $GROUPUSER ]; then
	echo "Error: GROUPUSER not specified"
	exit 2;
fi

#create user
id -u $NEWUSERNAME &>/dev/null || sudo adduser --disabled-password --gecos "" $NEWUSERNAME

sudo usermod -aG $GROUPUSER $NEWUSERNAME
sudo echo "debugvscode ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/debugvscode

#create keys
mkdir -p /home/$NEWUSERNAME/.ssh

if [ -f /home/$NEWUSERNAME/.ssh/id_rsa ]; then
	rm /home/$NEWUSERNAME/.ssh/id_rsa
fi

if [ -f /home/$NEWUSERNAME/.ssh/id_rsa.pub ]; then
	rm /home/$NEWUSERNAME/.ssh/id_rsa.pub
fi

NAMEHOST=$(uname -n)
ssh-keygen -t rsa -f /home/$NEWUSERNAME/.ssh/id_rsa -C $NEWUSERNAME@$NAMEHOST -N ""
cat /home/$NEWUSERNAME/.ssh/id_rsa.pub > /home/$NEWUSERNAME/.ssh/authorized_keys
sudo systemctl reload ssh
sudo systemctl status ssh

echo "Successfully"
