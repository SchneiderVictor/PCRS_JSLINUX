# PCRS_JSLINUX
JSLINUX, ported to PCRS (prototype)

emsdk is needed, please clone repo https://github.com/juj/emsdk.git and follow installation instructions.

*To run:

$ cd emsdk

$ source ./emsdk_env.sh

$ cd ../riscvemu-2017-08-06

$ make -f Makefile.js js/riscvemu64.js

$ cd ../prototype

$ nodejs --use_strict app.js *(or your equivalent)

*open browser: localhost:5000 -> click initialize (or localhost:5000/index2.html)

*Note: The first 5 steps are only necessary if changes are made to any file OUTSIDE of the prototype folder
