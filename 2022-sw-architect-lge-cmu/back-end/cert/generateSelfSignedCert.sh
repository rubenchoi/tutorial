#!/bin/bash

SCRIPT_PATH=$(dirname "${BASH_SOURCE[0]}")
CERT_PATH="${SCRIPT_PATH}"
SERVER_KEY="${CERT_PATH}/server.key"
SERVER_CSR="${CERT_PATH}/server.csr"
SERVER_CRT="${CERT_PATH}/server.crt"
EXTFILE="${CERT_PATH}/cert_ext.cnf"
OPENSSL_CMD="/mingw64/bin/openssl"
COMMON_NAME="TEAM4.com"

function show_usage {
    printf "Usage: $0 [options [parameters]]\n"
    printf "\n"
    printf "Options:\n"
    printf " -cn, Provide Common Name for the certificate\n"
    printf " -h|--help, print help section\n"

    return 0
}

case $1 in
     -cn)
         shift
         COMMON_NAME="$1"
         ;;
     --help|-h)
         show_usage
         exit 0
         ;;
     *)
        ## Use hostname as Common Name
        COMMON_NAME=`/usr/bin/hostname`
        ;;
esac

echo ${CERT_PATH}
mkdir -p ${CERT_PATH}

# generating server key
echo "Generating private key"
echo $OPENSSL_CMD genrsa -out $SERVER_KEY  4096
$OPENSSL_CMD genrsa -out $SERVER_KEY  4096
if [ $? -ne 0 ] ; then
   echo "ERROR: Failed to generate $SERVER_KEY"
   exit 1
fi

# Generating Certificate Signing Request (CSR)
echo "Generating Certificate Signing Request"
echo $OPENSSL_CMD req -new -key $SERVER_KEY -out $SERVER_CSR -subj //CN=TEAM4
$OPENSSL_CMD req -new -key $SERVER_KEY -out $SERVER_CSR -subj //CN=TEAM4
if [ $? -ne 0 ] ; then
   echo "ERROR: Failed to generate $SERVER_CSR"
   exit 1
fi


echo "Generating self signed certificate"
echo $OPENSSL_CMD x509 -req -days 3650 -in $SERVER_CSR -signkey $SERVER_KEY -out $SERVER_CRT
$OPENSSL_CMD x509 -req -days 3650 -in $SERVER_CSR -signkey $SERVER_KEY -out $SERVER_CRT
if [ $? -ne 0 ] ; then
   echo "ERROR: Failed to generate self-signed certificate file $SERVER_CRT"
fi

echo "Convert PEM to DER"
echo $OPENSSL_CMD x509 -in server.crt -outform der -out server.der
$OPENSSL_CMD x509 -in server.crt -outform der -out server.der
if [ $? -ne 0 ] ; then
   echo "ERROR: Failed to convert PEM to DER"
fi
