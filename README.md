#### ***Install Dependencies***
###### npm install
#
#
#### ***Set Environment Variables***
###### Create a new file .env and copy the content of .env.sample to it.
###### Add Upwork Username and Password.
###### Add URL of freelancers profile e.g. ["https://www.upwork.com/freelancers/~010b3bced96bb518ba", "...", "..."]
#
#
#### ***Start Scrapping***
###### ***For Local Environment*** : npm run start
###### ***For Production Environment*** : npm run start-prod
#
#
#### ***VM Setup***
##### Ubuntu 18.04 - [AWS LightSail](https://lightsail.aws.amazon.com)
- ls
- sudo apt update
- curl -sL https://raw.githubusercontent.com/creationix/nvm/v0.35.3/install.sh -o install_nvm.sh
- nano install_nvm.sh
- bash install_nvm.sh
- source ~/.profile
- nvm ls-remote
- nvm install 12.19.0
- nvm use 12.19.0
- node -v
- nvm alias default 12.19.0
- npm -v
- wget https://github.com/StarkDevelopers/upwork-scrapper/archive/refs/heads/master.zip
- unzip master.zip 
- sudo apt-get install unzip
- unzip master.zip 
- ls
- cd upwork-scrapper-master/
- ls
- cd functions/
- ls
- npm install
- nano .env
- sudo apt-get install gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget xvfb x11vnc x11-xkb-utils xfonts-100dpi xfonts-75dpi xfonts-scalable xfonts-cyrillic x11-apps
- sudo apt-get update
- sudo apt-get install -y libgbm-dev
- xvfb-run --server-args="-screen 0 1920x1080x24" node index.js
