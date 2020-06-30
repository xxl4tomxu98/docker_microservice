
# Microservices with Docker Example




Goals...
  Start the entire application by running `docker-compose up`
  By default, copy source code into the containers
  Use bind mounts locally by providing a `docker-compose.override.yml` file
  Have at least two of the APIs use separate Postgres DB services
  Include an example of using additional networks to isolate services from each other (i.e. putting an API and its DB service on a separate network so that only the API can access the DB service)???

Architecture...
  Have the React app call into each of the APIs?
  Have an example of at least one API endpoint that calls to another API endpoint (to show point to point service communication)

Heroku...
  Test deploying each of the containers to a single Dyno???
  Does this work as long as only a single container (the frontend container) is labeled as `web`???





Create React App...
  Provide a configuration that starts frontend and backend... but also provided a configuration that just starts the backend so that CRA can be used on the host system outside of Docker???






Wow... there's a RabbitMQ Docker image... it'd be super fun to include an example of using a message broker... but really not necessary :(





* React UI (served by a lightweight Node/Express application)

Create React App and Docker...
  How do you use a container with CRA???
  How do you create a base case that's the production build while overriding for a local dev scenario???

This --> https://mherman.org/blog/dockerizing-a-react-app/

Had to set `stdin_open` to `true` to keep the container from exiting
  https://github.com/facebook/create-react-app/issues/8688
  https://github.com/facebook/create-react-app/issues/8688#issuecomment-602149917
  https://docs.docker.com/engine/reference/run/#foreground

Testing...
  Can the React app make calls to all of the APIs?
  Can you make changes to a component have CRA detect the change and hot reload?






* Microservice APIs (each is its own self-contained stack… HTTP server and data
  persistence)
  * Customer Support API
  * Catalog Management API
  * Order Processing API
  * User Authentication API

Testing...
  Can you make a change to an API and have nodemon detect and restart the APIs service?

Use Python for one of the APIs???
  Follow the steps outlined in the project and compare to popular online solutions...





Windows testing...
  Does this work as expected on Windows?




