!/bin/sh
sudo apt-get update
sudo apt-get install -y \
    curl \
    software-properties-common \
    g++ \
    python \
    p7zip-full
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
nvm install 9.0.0
npm install
npm rebuild grpc --build-from-source --runtime=electron --target=4.2.2 --target_arch=x64 --dist-url=https://atom.io/download/electron
7z x prontuchain-keys.zip -o$HOME
