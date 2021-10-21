CUR_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
set -e
: "${TYPE?need to set TYPE}"
set -e
: "SIZE?need to set SIZE"
echo "$TYPE"
set -e 
: "$EXTENTION?need to set EXTENTION"
mkdir -p $CUR_DIR/testFiles/
mkdir -p $CUR_DIR/testFiles/$TYPE

dd if=/dev/urandom of=$CUR_DIR/testFiles/$TYPE/$TYPE.$EXTENTION bs=$SIZE count=1
