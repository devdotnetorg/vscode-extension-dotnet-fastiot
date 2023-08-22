#!/bin/bash
# Run: 
# chmod +x 7_changeconfigssh.sh
# ./7_changeconfigssh.sh

set -e #Exit immediately if a comman returns a non-zero status

echo "Run: 7_changeconfigssh.sh"

# definition of variables
# check inside docker container
if [ -f /.dockerenv ]; then
	echo "The script is executed inside the docker container."
	declare existence="docker_container"
else 
	declare existence="native"
fi
#

echo "Changing settings in /etc/ssh/sshd_config"

#After creating a user:
#/etc/ssh/sshd_config
#PubkeyAuthentication yes
#ChallengeResponseAuthentication yes
#AuthenticationMethods publickey password

filename="/etc/ssh/sshd_config"

#run
sudo sed -ri "s|^#?PubkeyAuthentication\s+.*|PubkeyAuthentication yes|" $filename
sudo sed -ri "s|^#?ChallengeResponseAuthentication\s+.*|ChallengeResponseAuthentication yes|" $filename
sudo sed -ri "s|^#?AuthenticationMethods\s+.*|AuthenticationMethods publickey password|" $filename

#add

if sudo grep -Fxq "PubkeyAuthentication yes" $filename
then
    echo "String exists: PubkeyAuthentication yes"
else
	#newline
	sudo sh -c "echo '\n' >> $filename"
    echo "Adding a line: PubkeyAuthentication yes"
	sudo sh -c "echo 'PubkeyAuthentication yes' >> $filename"
fi

if grep -Fxq "ChallengeResponseAuthentication yes" $filename
then	
    echo "String exists: ChallengeResponseAuthentication yes"
else
	#newline
	sudo sh -c "echo '\n' >> $filename"
    echo "Adding a line: ChallengeResponseAuthentication yes"
	sudo sh -c "echo 'ChallengeResponseAuthentication yes' >> $filename"
fi

if grep -Fxq "AuthenticationMethods publickey password" $filename
then
    echo "String exists: AuthenticationMethods publickey password"
else
	#newline
	sudo sh -c "echo '\n' >> $filename"
    echo "Adding a line: AuthenticationMethods publickey password"
	sudo sh -c "echo 'AuthenticationMethods publickey password' >> $filename"
fi

#reload
echo "Reload ssh"

if [ $existence != "docker_container" ]; then
	# native
	sudo systemctl reload ssh
	sudo systemctl status ssh --no-pager -l
else
	# docker_container
	echo "Restarting the ssh service inside a docker container is not possible,"
	echo "so the docker container will be restarted"
fi

echo "Successfully"
