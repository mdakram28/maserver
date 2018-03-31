#!/bin/bash

cd ~/Downloads
wget https://nodejs.org/dist/v8.9.0/node-v8.9.0-linux-armv6l.tar.gz
tar -xzf node-v8.9.0-linux-armv6l.tar.gz
cd node-v8.9.0-linux-armv6l/
sudo cp -R * /usr/local/

cd ~
git clone https://github.com/mdakram28/maserver.git
cd maserver
rm id.txt
rm -rf node_modules
npm install

sudo sed -i '/exit/d' /etc/rc.local
echo "cd /home/pi/maserver; npm start &; exit 0;" >> /etc/rc.local