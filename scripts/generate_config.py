import json
import os

from predeployed_generator.openzeppelin.proxy_admin_generator import ProxyAdminGenerator
from filestorage_predeployed import (UpgradeableFileStorageGenerator, FILESTORAGE_ADDRESS,
                                     FILESTORAGE_IMPLEMENTATION_ADDRESS,
                                     FILESTORAGE_ADMIN_ADDRESS)

DIR_PATH = os.path.join(os.path.dirname(os.path.realpath(__file__)), '..', 'test')
BASE_CONFIG_PATH = os.path.join(DIR_PATH, 'data', 'base_config.json')
CONFIG_PATH = os.path.join(DIR_PATH, 'data', 'config.json')

if __name__ == '__main__':
    with open(BASE_CONFIG_PATH, 'r') as f:
        raw_config = f.read()
        config = json.loads(raw_config)
    schain_owner = config['skaleConfig']['sChain']['schainOwner']
    proxy_admin = ProxyAdminGenerator().generate_allocation(
        contract_address=FILESTORAGE_ADMIN_ADDRESS,
        owner_address=schain_owner
    )
    filestorage_upgradeable = UpgradeableFileStorageGenerator().generate_allocation(
        contract_address=FILESTORAGE_ADDRESS,
        proxy_admin_address=FILESTORAGE_ADMIN_ADDRESS,
        implementation_address=FILESTORAGE_IMPLEMENTATION_ADDRESS,
        allocated_storage=10000000,
        schain_owner=schain_owner
    )
    config['accounts'].update(proxy_admin)
    config['accounts'].update(filestorage_upgradeable)
    with open(CONFIG_PATH, 'w') as f:
        f.write(json.dumps(config, indent=4))
