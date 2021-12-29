#!/bin/bash
# Run: 
# chmod +x createaccountroot.sh
# ./createaccountroot.sh

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: createaccountroot.sh"

#create keys
mkdir -p /root/.ssh

if [ -f /root/.ssh/id_rsa ]; then
	rm /root/.ssh/id_rsa
fi

if [ -f /root/.ssh/id_rsa.pub ]; then
	rm /root/.ssh/id_rsa.pub
fi

NAMEHOST=$(uname -n)
ssh-keygen -t rsa -f /root/.ssh/id_rsa -C root@$NAMEHOST -N ""
cat /root/.ssh/id_rsa.pub > /root/.ssh/authorized_keys
sudo systemctl reload ssh
sudo systemctl status ssh

echo "Successfully"
