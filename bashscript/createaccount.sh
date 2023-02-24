#!/bin/bash
# Run: 
# chmod +x createaccount.sh
# ./createaccount.sh debugvscode sudo ed25519 256

# https://manpages.ubuntu.com/manpages/jammy/man1/ssh-keygen.1.html
# TYPEKEY = dsa | ecdsa | ed25519 | rsa
# BITS = 256 | 384 | 521 | 1024 | 2048 | 3072 | 4096

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: createaccount.sh"

#
NEWUSERNAME="$1"
GROUPUSER="$2"
TYPEKEY="$3"
BITS="$4"
#

if [ -z $NEWUSERNAME ]; then
	echo "Error: NEWUSERNAME not specified"
	exit 1;
fi

if [ -z $GROUPUSER ]; then
	echo "Error: GROUPUSER not specified"
	exit 2;
fi

if [ -z $TYPEKEY ]; then
	echo "Error: TYPEKEY not specified"
	exit 3;
fi

if [ -z $BITS ]; then
	echo "Error: BITS not specified"
	exit 4;
fi

#create user
id -u $NEWUSERNAME &>/dev/null || sudo adduser --disabled-password --gecos "" $NEWUSERNAME

sudo usermod -aG $GROUPUSER $NEWUSERNAME
sudo echo "debugvscode ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/debugvscode

#create keys
mkdir -p /home/$NEWUSERNAME/.ssh

if [ -f /home/$NEWUSERNAME/.ssh/id_$TYPEKEY ]; then
	rm /home/$NEWUSERNAME/.ssh/id_$TYPEKEY
fi

if [ -f /home/$NEWUSERNAME/.ssh/id_$TYPEKEY.pub ]; then
	rm /home/$NEWUSERNAME/.ssh/id_$TYPEKEY.pub
fi

NAMEHOST=$(uname -n)
ssh-keygen -t $TYPEKEY -b $BITS -f /home/$NEWUSERNAME/.ssh/id_$TYPEKEY -C $NEWUSERNAME@$NAMEHOST -N ""
cat /home/$NEWUSERNAME/.ssh/id_$TYPEKEY.pub > /home/$NEWUSERNAME/.ssh/authorized_keys
sudo systemctl reload ssh
sudo systemctl status ssh

echo "Successfully"
