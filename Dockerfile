FROM ubuntu:20.04

WORKDIR /usr/src/backend

RUN apt-get update -y && \
    apt-get install -y python3-pip python3-dev python3-psycopg2

# We copy just the requirements.txt first to leverage Docker cache
COPY ./requirements.txt /usr/src/backend/requirements.txt
RUN pip install -r requirements.txt

ENTRYPOINT [ "python3" ]

CMD [ "-m" , "flask", "run", "--host=0.0.0.0"]