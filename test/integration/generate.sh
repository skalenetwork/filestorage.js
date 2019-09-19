#! /bin/bash
if [ ! -d ./testFiles/ ]
then
    mkdir -p ./testFiles/
    mkdir -p ./testFiles/tiny
    mkdir -p ./testFiles/small
    mkdir -p ./testFiles/large

    for n in {1..3}; do
        dd if=/dev/urandom of=./testFiles/tiny/tiny$( printf %00d "$n" ).txt bs=1024 count=1
    done

    for n in {1..3}; do
        dd if=/dev/urandom of=./testFiles/small/small$( printf %00d "$n" ).txt bs=1024 count=1024
    done

    for n in {1..1}; do
        dd if=/dev/urandom of=./testFiles/large/large$( printf %00d "$n" ).txt bs=1047552 count=94
    done
fi

