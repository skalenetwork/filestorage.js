#! /bin/bash
CUR_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
if [ ! -d $CUR_DIR/testFiles/ ]
then
    mkdir -p $CUR_DIR/testFiles/
    mkdir -p $CUR_DIR/testFiles/tiny
    mkdir -p $CUR_DIR/testFiles/small
    mkdir -p $CUR_DIR/testFiles/large

    for n in {1..3000}; do
        dd if=/dev/urandom of=$CUR_DIR/testFiles/tiny/tiny$( printf %00d "$n" ).txt bs=1024 count=1
    done

    for n in {1..3000}; do
        dd if=/dev/urandom of=$CUR_DIR/testFiles/small/small$( printf %00d "$n" ).txt bs=1024 count=1024
    done

    for n in {1..50}; do
        dd if=/dev/urandom of=$CUR_DIR/testFiles/large/large$( printf %00d "$n" ).txt bs=1047552 count=94
    done
fi

