#!/bin/bash
x=1
while [ $x -le 5 ]
do
    echo "test counter $x" 
    x=$(( $x + 1 ))
    sleep 1
done