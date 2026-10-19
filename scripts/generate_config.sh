VERSION=$(node -p "require('@skalenetwork/filestorage/package.json').version")
ARTIFACTS_PATH=$PWD/test/data/artifacts.json
pip install filestorage-predeployed==$VERSION "web3<6"
python scripts/generate_config.py

