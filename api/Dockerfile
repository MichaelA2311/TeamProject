FROM ubuntu:22.04

RUN apt-get update &&\
    apt-get install -y ffmpeg python3 python3-pip libpq-dev

WORKDIR /app

COPY . /app

RUN pip3 install -r requirements.txt

RUN python3 setup.py install 
