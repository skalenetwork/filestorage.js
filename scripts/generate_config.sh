VERSION=$(node -p "require('@skalenetwork/filestorage/package.json').version")
ARTIFACTS_PATH=$PWD/test/data/artifacts.json
pip install filestorage-predeployed==$VERSION
python scripts/generate_config.py

