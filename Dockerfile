# Use an official grafana runtime as a parent image
FROM grafana/grafana

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
ADD ./grafana-proxy /app
ADD ./start.sh /app

USER root

# Install node.js and node package manager
RUN apt-get update && apt-get -y install nodejs

# Make port 3333 available to the world outside this container,
# this is where grafana-proxy is running.
EXPOSE 3333

# Define environment variables
ENV GRAFANA_PROXY http://localhost
ENV GRAFANA_PROXY_ROOT_URL /
ENV GRAFANA_PROXY_PORT 3333
ENV GRAFANA_PROXY_REDIRECT_PORT 3333
ENV GRAFANA_HOST http://localhost
ENV GRAFANA_PORT 3000
ENV ES_HOST http://localhost
ENV ES_PORT 9200
ENV KAPUA_HOST http://localhost
ENV KAPUA_PORT 8080
ENV KAPUA_USER kapua-sys
ENV KAPUA_PASS kapua-password
ENV GF_SERVER_PROTOCOL http
ENV GF_SERVER_DOMAIN localhost
ENV GF_SERVER_ROOT_URL http://localhost:3000/gp
ENV GF_SERVER_HTTP_PORT 3000

RUN echo "#################################### Auth Proxy ##########################" >> $GF_PATHS_CONFIG &&\
    echo "[auth.proxy]" >> $GF_PATHS_CONFIG &&\
    echo "enabled = true" >> $GF_PATHS_CONFIG &&\
    echo "header_name = X-WEBAUTH-USER" >> $GF_PATHS_CONFIG &&\
    echo "header_property = username" >> $GF_PATHS_CONFIG &&\
    echo "auto_sign_up = true" >> $GF_PATHS_CONFIG

# Run node app when the container launches
ENTRYPOINT ["./start.sh"]