#!/bin/bash
# Run: 
# chmod +x createaccountroot.sh
# ./createaccountroot.sh ed25519 256

# https://manpages.ubuntu.com/manpages/jammy/man1/ssh-keygen.1.html
# TYPEKEY = dsa | ecdsa | ed25519 | rsa
# BITS = 256 | 384 | 521 | 1024 | 2048 | 3072 | 4096

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: createaccountroot.sh"

#
TYPEKEY="$1"
BITS="$2"
#

if [ -z $TYPEKEY ]; then
	echo "Error: TYPEKEY not specified"
	exit 3;
fi

if [ -z $BITS ]; then
	echo "Error: BITS not specified"
	exit 4;
fi

#create keys
mkdir -p /root/.ssh

if [ -f /root/.ssh/id_$TYPEKEY ]; then
	rm /root/.ssh/id_$TYPEKEY
fi

if [ -f /root/.ssh/id_$TYPEKEY.pub ]; then
	rm /root/.ssh/id_$TYPEKEY.pub
fi

NAMEHOST=$(uname -n)
ssh-keygen -t $TYPEKEY -b $BITS -f /root/.ssh/id_$TYPEKEY -C root@$NAMEHOST -N ""
cat /root/.ssh/id_$TYPEKEY.pub > /root/.ssh/authorized_keys
sudo systemctl reload ssh
sudo systemctl status ssh

echo "Successfully"
