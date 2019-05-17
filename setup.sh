!/bin/sh
sudo apt-get update
sudo apt-get install curl -y
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
source ~/.bashrc
nvm install 9.0.0
sudo apt-get install python -y
npm install
npm rebuild grpc --build-from-source --runtime=electron --target=4.2.2 --target_arch=x64 --dist-url=https://atom.io/download/electron