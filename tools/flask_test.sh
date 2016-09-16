#!/bin/bash

cd ..
cd webserver
cd backend
export FLASK_APP=dalab.py
export FLASK_DEBUG=1
flask run
