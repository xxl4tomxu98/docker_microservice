
# Microservices Online Catalog

This repo contains the starter and solution files for the project for
the "Microservices With Docker" subject.

## Microservices With Docker
Develop an application using a microservices architecture and the key to design and integrate the microservices that'll make up this application is to learn how to use your Docker skills to Dockerize a microservices-based application.

 - Describe the benefits of using Docker to develop microservices-based applications
 - Describe how to use Docker Compose to define the services that makeup a microservices-based application
 - Use a multi-stage Dockerfile to create Docker images for development and production
 - Use a Dockerfile to create a container for a Node/Express API application
 - Use a Compose service to control the creation and startup of a Node/Express API application container
 - Use a .env file to define variables to avoid hard-coding configuration values in a docker-compose.yml file
 - Use the COMPOSE_PROJECT_NAME variable to configure the Compose project name to customize the Docker item name prefix
 - Use a wait-for script to detect when a container is started and ready to accept connections
 - Use the Compose networks option to configure custom networks to prevent unintended access between microservices
 - Use a Dockerfile to create a container for a React application created by the Create React App tooling
 - Use a Compose service to control the creation and startup of a React application container created by the Create React App tooling

## Reviewing the example application architecture
The example used in this article is an application that allows customers to order products from an online catalog. It contains the following capabilities:

Customer Support
Catalog Management
Order Processing
User Authentication
The application uses API composition for the client-side UI (user interface), so the UI talks directly to the application's microservices. The client-side UI is built using React and uses the Fetch API to make calls to the microservice RESTful API endpoints, which are built using Node.js and Express. PostgreSQL databases are used for data persistence.

# microservices-online-ordering-application

## Running the application without Docker
To fully understand the benefits of Dockerizing a microservices-based application, start with reviewing the steps that are needed to get the non-Docker version of the application up and running within your local development environment.

After cloning the project repo, you'll have two copies of the application: *the starter folder contains the non-Docker version of the application and the solution folder contains the Dockerized version of the application.*

The project structure for both versions of the application looks like this:

``` shell
├── backend
│   ├── catalog-management
│   ├── customer-support
│   └── order-processing
└── frontend
```

Each of the folders within the backend folder, catalog-management, customer-support, and order-processing, contains a microservice Node/Express API application for the capability described by its folder name. The frontend folder contains the client-side UI React application (created by the Create React App tooling).

Each microservice and the client-side UI contains just the bare minimum of functionality to demonstrate that part of the application. The example application doesn't include the User Authentication service to keep things as simple as possible.

To get the non-Docker version of the application up and running within your local development environment, all of the following steps need to be completed:

Note: Be sure to complete these steps of the README of the application contained within the starter folder!

As mentioned earlier, the React client-side UI uses the Fetch API to make calls to the microservice Node/Express API endpoints. The list of products list supplied by the Catalog Management microservice (backend/catalog-management) and the list of customers is supplied by the Customer Support microservice (backend/customer-support). The Customer Support microservice uses the Order Processing microservice (backend/order-processing) to retrieve each customer's list of orders.

## Running the application with Docker
To get the Dockerized version of the application up and running within your local development environment, complete the the steps in the dockerized folder README.md file:

## Why use Docker with microservices?
Without Docker, manually completing all of the required setup to get the application up and running in your local development is time consuming and prone to errors. Consider also, that the example application is relatively small. Can you imagine having to perform all of those steps for an application that had dozens of microservices?

While easing local development is a major incentive for using Docker, there are other benefits to be aware of.

## Automating infrastructure
Microservices-based applications are typically delivered to end-users using an automated process consisting of a continuous integration and deployment pipeline (usually referred to as a CI/CD pipeline). Using Docker also gives you the ability to automate your application's infrastructure (i.e. servers, networking, etc.) This means that your CI/CD pipeline doesn't just test and deploy the latest version of your application, it tests and deploys the latest version of your application and all of the related infrastructure to support the application.

## Independently scaling services
Once your application is deployed into production, utilizing Docker containers allows you to scale up individual microservices by creating and running additional instances to ensure that your application's performance meets your end user's expectations. Having the ability to spin up new container instances when a container unexpectedly becomes unhealthy also keeps your application from going down or offline.

## Dockerizing a microservices-based application
Now that you've seen the benefits, it's time to learn how to Dockerize a microservices-based application.

Single Docker application vs multiple Docker applications
For smaller teams and projects, it's general okay (and even preferred) to use Docker Compose and a single docker-compose.yml file to configure your Docker application. This gives you the ability to run a single docker-compose up command to start the application. For larger teams that support multiple, separate projects (one per microservice), it might make sense to use Docker Compose to create a separate Docker application for each microservice.

For this example, a single Docker Compose file will be used to configure a single Docker application containing the following services:

- frontend - React UI (Node/CRA)
- catalog-management - Catalog Management Microservice API (Node/Express)
- customer-support - Customer Support Microservice API (Node/Express)
- customer-support-db - Customer Support Database (PostgreSQL)
- order-processing - Order Processing Microservice API (Node/Express)
- order-processing-db - Order Processing Database (PostgreSQL)
Using Node/Express and PostgreSQL for all of the microservice APIs and databases is an arbitrary choice to keep things as simple as possible for this article. In the real world, each microservice could use different technology stacks.

## Configuring the first microservice API
The goal for each microservice API is to support running the Node/Express application in a container so that we're mirroring the production environment as closely as possible while retaining the ability to edit a code file and have the process in the container detect the change and automatically restart. This helps to keeps the code/run/test development feedback loop as short as possible.

Writing unit tests shortens the development feedback loop even further by providing you with feedback without having to run your application. Even though this article won't focus on unit testing, most real world projects will leverage unit testing.

You'll start with configuring the catalog-management microservice API. It's a great example to start with as it doesn't have any service dependencies. Instead of using a database, it uses the faker npm package to create a list of products that it stores in-memory.

Creating the Dockerfile
In the backend/catalog-management folder, add a file named Dockerfile containing the following content:

```Dockerfile
# Base

FROM node:12-alpine as base

EXPOSE 8081

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm ci && npm cache clean --force

ENV PATH=/app/node_modules/.bin:$PATH

# Development

FROM base as dev

ENV NODE_ENV=development

WORKDIR /app

RUN npm install --only=development

CMD ["nodemon", "./app.js"]

# Production

FROM base as prod

WORKDIR /app

COPY . .

CMD ["node", "./app.js"]
```

In the above Dockerfile, multi-stage builds are used so that a single Dockerfile can create development and production images.

In the base image, the FROM command is used to specify the node:12-alpine image as the starting point. The EXPOSE command is used to document that the Express application will be listening on port 8081. Later in the docker-compose.yml file, you'll publish that port so that the React client-side UI can access the microservice API.

The working directory is set to /app with the WORKDIR command. Then the package.json and package-lock.json files are copied into the image using the COPY command and the RUN command is used to install the project's dependencies using the npm ci command. Using the ENV command to set the NODE_ENV environment variable keeps the npm ci command from installing any of the project's development dependencies. To keep the base image as lean as possible, the npm cache is cleared with the ```npm cache clean --force``` command.

*The ENV command is used to add the node_modules/.bin folder to the path so that commands like nodemon can be executed without having to provide the path to the node_modules/.bin folder*.

In the dev image, the ENV command is used to set the NODE_ENV environment variable to development which configures Express to be optimized for a development environment. After using the WORKDIR command to set the working directory to /app, the RUN command is used to install the project's development dependencies by passing the ```--only=development``` flag to the ```npm install``` command. Development dependencies aren't needed in production, so installing them only in the dev image keeps them out of the prod image.

Then CMD command is used to start the application using nodemon so that changes to code files will restart the Node process running in the container. Notice that the project's files aren't copied into the image. That's intentional as a bind mount will be configured in the docker-compose.yml file so that you can edit code directly on your host system.

And finally, in the prod image, the COPY command is used to copy the project's files into the image and the CMD command is used to start the application using node.

The Dockerfiles for the customer-support and order-processing microservice APIs will be very similar to the above Dockerfile. The Dockerfile for the React client-side UI (as you'll see later in this article) will use some of the same techniques, but will vary in significant ways.

In the backend/catalog-management folder, add a .dockerignore file with the following content:

```.dockerignore
.git
*Dockerfile*
*docker-compose*
node_modules
```

The .dockerignore file is similar to a .gitignore file, but instead of configuring Git to ignore files and folders, you're configuring Docker to ignore the listed files and folders when performing COPY operations within a Dockerfile.

## Adding the Compose service
Now you can add a docker-compose.yml file to the root of the project, containing the following content:

``` yml
version: '3.8'

services:

  catalog-management:
    build:
      context: ./backend/catalog-management
      target: dev
    ports:
      - 8081:8081
    volumes:
      - ./backend/catalog-management:/app:delegated
      - /app/node_modules
```

In the above docker-compose.yml file, the build configuration option is used to specify the build context for the catalog-management service. Supplying the path ./backend/catalog-management for the build context will cause Compose to look for a Dockerfile at that location. The target option specifies to build the dev stage within the Dockerfile.

The ports option publishes port 8081 in the container to port 8081 on the host system. In just a bit, you'll see how this will allow you to reference the container's microservice API using the URL http://localhost:8081/.

Publishing a container port isn't always necessary to do. In this case, you want the React client-side UI application to be able to access the catalog-management microservice API, so publishing a port is necessary to do as the React application will be running in a browser on the host system. Later in this article, you'll see an example of a microservice that's only used internally by another microservice, so publishing a port on the host system isn't necessary to do.

*The volumes option is used to define a bind mount and an anonymous volume. When you provide a string, like ./backend/catalog-management:/app, that maps a host file system path to a container path, you're creating a bind mount. When you provide a string, like /app/node_modules, that's just a path on the container, you're creating an anonymous volume.*

Later in this article, you'll see an example of how to create a persistent named volume using the top-level volumes option.

The string ```./backend/catalog-management:/app:```delegated bind mounts the path ```./backend/catalog-management``` on the host system to the path /app in the container. Creating a bind mount makes the files (and subfolders) contained with the supplied host path (./backend/catalog-management) available within the supplied container path (/app) without having to physically copying the files into the container. This gives you the ability to edit the contents of a file on the host system (using the editor of your choice) and the file will also be updated in the container (since the host and container are referencing the same file). Remember that the CMD command was used in the service's Dockerfile to start the application using nodemon, so changes to code files will restart the Node process running in the container.

The delegated flag supplied after the container path /app in the bound mount configuration, is specified to ensure the optimal performance when using Docker Desktop for Mac. For more information, see the Performance Tuning for Volume Mounts article on the Docker website.

The string /app/node_modules creates an anonymous volume, which is a Docker volume that isn't explicitly named. Anonymous volumes are useful when you need to exclude a subfolder from a bind mount. For example, when creating a bind mount to the host path ./backend/catalog-management, you don't want the node_modules folder (if it's present) to be mounted in the container, as the container's image already contains the project's dependencies. Defining an anonymous volume for the path /app/node_modules in the container prevents the bind mount from using the node_modules folder on the host file system.

Anonymous volumes are created every time a container is created, so an anonymous volume shouldn't contain data that you want to persist across container instances.

## Testing the service
To test the service, run the command docker-compose up. Compose will load the configuration from the docker-compose.yml file and create the configured networks, volumes, and services, to prepare to start the application. In the terminal, Compose will generate output as it completes each step in the process.

### First, Compose creates the default network:

- Creating network "<base folder name>_default" with the default driver
Next, you'll see that Compose begins the process of building the image for the catalog-management service (using the Dockerfile specified in the docker-compose.yml file):

- Building catalog-management
After the image is created, Compose will create the container for the catalog-management service:

- Creating <base folder name>_catalog-management_1 ... done
When the container has finished starting up, you'll see the following output:

``` shell
catalog-management_1  | [nodemon] 2.0.4
catalog-management_1  | [nodemon] to restart at any time, enter `rs`
catalog-management_1  | [nodemon] watching path(s): *.*
catalog-management_1  | [nodemon] watching extensions: js,mjs,json
catalog-management_1  | [nodemon] starting `node ./app.js`
catalog-management_1  | Listening for connections on port 8081...
```
Now if browse to the URL http://localhost:8081/ you'll receive the following response:

``` json
{"message":"Welcome to the Catalog Management service!"}
```

You can also browse to the URL http://localhost:8081/products to receive a response containing a list of products.

To stop the application (i.e. stop the running containers), press CTRL+C.

```
^CGracefully stopping... (press Ctrl+C again to force)
Stopping <base folder name>_catalog-management_1 ... done
Starting the application in detached mode
```
If you don't want to see the output from the application(s) displayed in the terminal after the container(s) are started, you can also start your application in detached mode using the command docker-compose up -d.

After the command has completed, you can view the containers by running the command docker-compose ps:

``` shell
            Name                          Command               State           Ports
----------------------------------------------------------------------------------------------
<base folder name>_catalog-management_1   docker-entrypoint.sh nodem ...   Up      0.0.0.0:8081->8081/tcp
```
You can view the networks and volumes on your system by respectively running the commands ```docker network ls``` and ```docker volume ls```.

Running the command ```docker-compose stop``` will stop the application's running containers:

``` shell
Stopping scratch_catalog-management_1 ... done
```

Running the command docker-compose ps again will show you the stopped containers:

``` shell
            Name                          Command                State     Ports
--------------------------------------------------------------------------------
<base folder name>_catalog-management_1   docker-entrypoint.sh nodem ...   Exit 143
```

Restarting the application after making a configuration change
After making a change to a Dockerfile or the docker-compose.yml file, you can simply re-run the ```docker-compose up --build``` command without first running ```docker-compose down```. Compose will determine which containers need to be stopped and recreated.

If a new project dependency is installed using npm install, you'll need to run the ```docker-compose up --build``` command to rebuild/recreate the image and container associated with that service. This is necessary to do because the project dependencies are installed during the image building process (as defined within the service's Dockerfile).

## Cleaning up
To stop and remove your application's containers and networks (created by the command docker-compose up), run the command ```docker-compose down```:

``` shell
Removing <base folder name>_catalog-management_1 ... done
Removing network <base folder name>_default
```

By default, when running the docker-compose down command, volumes (named or anonymous) are not removed. To remove any volumes attached to your application's containers (named or anonymous) include the -v flag:

``` shell
    docker-compose down -v
```

Images are also not removed by default. Not removing the images created by your docker-compose.yml configuration reduces the overhead of restarting the application the next time you run the command docker-compose up. If you're not going to restart the application anytime soon or you want to remove all traces of the application's Docker items (to have a clean baseline), you can include the --rmi all flag to remove all of the images used by your application's services:

``` shell
    docker-compose down -v --rmi all
```

You can also manually remove images using the command ```docker image rm <container id or name>```. Compose will rebuild any images that aren't available the next time that the docker-compose up command is ran.

If you run the command docker-compose down and forget to include the -v flag and your containers are attached to any anonymous volumes, those volumes will effectively be orphaned (i.e. volumes not associated with a container).

Running the command ```docker volume ls``` will display the volumes on your system. Anonymous volumes are volumes that don't have a human readable name:

``` shell
DRIVER              VOLUME NAME
local               6b6c626c6cabbffa0373b64f58dd662aacce9f9f1db885d3de36f8b70a1f6a81
local               2464d1b5136e89304c9e61bb338c044ff0a2303db1767081219d5d8ee59ae959
local               ee57187dc765f86f8c1f5decd2f06e842838f50266805a07aef5cca5c05c51d4
```

To free up disk space on your system, you can run the command ```docker volume prune``` to remove all local volumes not used by at least one container:
``` shell
WARNING! This will remove all local volumes not used by at least one container.
Are you sure you want to continue? [y/N] y
Deleted Volumes:
2464d1b5136e89304c9e61bb338c044ff0a2303db1767081219d5d8ee59ae959
6b6c626c6cabbffa0373b64f58dd662aacce9f9f1db885d3de36f8b70a1f6a81
ee57187dc765f86f8c1f5decd2f06e842838f50266805a07aef5cca5c05c51d4

Total reclaimed space: 88.85MB
```

## Avoiding hard-coded configuration values
The catalog-management service is currently configured to be published to port 8081, but what is port 8081 was already in use on your system? Luckily, the Node/Express application is written to respect the PORT environment variable (if it's set):

``` shell
// ./backend/catalog-management/app.js

// Code removed for brevity.

const port = process.env.PORT || 8081;
```

This allows you to reconfigure the service's port by setting the PORT environment variable in the docker-compose.yml file:

``` yml
version: '3.8'

services:

  catalog-management:
    build:
      context: ./backend/catalog-management
      target: dev
    ports:
      - 5000:5000
    volumes:
      - ./backend/catalog-management:/app:delegated
      - /app/node_modules
    environment:
      - PORT=5000
```

Notice that the ports option was also updated with the new port number. With these changes, the catalog-management service will now listen for connections on port 5000. While this approach works, ideally you'd avoid changing the docker-compose.yml file to adjust for conflicts on your system. What works on your system might not work for another member of your team.

Compose offers an elegant solution to this problem by supporting variable substitution using an .env file. Add an .env file to the root project folder (the same folder that contains the docker-compose.yml file) with the following contents:

BACKEND_CATALOG_MANAGEMENT_PORT=8081
Then update the docker-compose.yml file to this:

``` yml
version: '3.8'

services:

  catalog-management:
    build:
      context: ./backend/catalog-management
      target: dev
    ports:
      - ${BACKEND_CATALOG_MANAGEMENT_PORT}:${BACKEND_CATALOG_MANAGEMENT_PORT}
    volumes:
      - ./backend/catalog-management:/app:delegated
      - /app/node_modules
    environment:
      - PORT=${BACKEND_CATALOG_MANAGEMENT_PORT}
```

Now each team member can easily set the published port number that makes the most sense for their systems without having to change the docker-compose.yml file. Using environment variables also allows you to avoid littering repetitive hard-coded configuration values throughout your Compose configuration as it increases in size and complexity.

## Configuring the Docker item name prefix
You might have noticed that Compose prefixes Docker items that it creates with the name of the folder that contains the docker-compose.yml file. For example, image names will default to <base folder name>_<service name> and container names will default to <base folder name>_<service name>_1 (the 1 suffix is known as the "replica number").

Compose does this to keep common service names (e.g. frontend, web, db, etc.) from colliding with other Compose projects on your system.

Another benefit to having an .env file in your project, is that you can configure the project name by setting the COMPOSE_PROJECT_NAME variable:

``` .env
COMPOSE_PROJECT_NAME=online-catalog-app
BACKEND_CATALOG_MANAGEMENT_PORT=8081
```

Now Compose will use your project name for the Docker item prefix:
``` shell
Creating network "online-catalog-app_default" with the default driver
Building catalog-management
...
Creating online-catalog-app_catalog-management_1 ... done
Attaching to online-catalog-app_catalog-management_1
```
## Configuring the second microservice API
Next, you'll configure the order-processing microservice API. This service uses a PostgreSQL database for data persistence, so you'll actually start with configuring the order-processing-db service.

### Adding a database service
To configure the order-processing-db service, add the following content to the docker-compose.yml file:

``` yml
version: '3.8'

services:

  # Other service omitted for brevity

  order-processing-db:
    image: postgres:12.3
    environment:
      - POSTGRES_USER=${BACKEND_ORDER_PROCESSING_DB_USERNAME}
      - POSTGRES_PASSWORD=${BACKEND_ORDER_PROCESSING_DB_PASSWORD}
      - POSTGRES_DB=${BACKEND_ORDER_PROCESSING_DB_DATABASE}
    volumes:
      - order-processing-db-data:/var/lib/postgresql/data

volumes:
  order-processing-db-data:
```

The service uses the official postgres Docker image, version 12.3 (the latest stable version at the time of this writing).

The top-level volumes option is used to define a persistent Docker volume named order-processing-db-data and the volumes option underneath the order-processing-db service maps the container path /var/lib/postgresql/data (the location of the PostgreSQL data files) to the order-processing-db-data volume.

The environment option is used to set the POSTGRES_USER, POSTGRES_PASSWORD, and POSTGRES_DB environment variables (within the container) to configure the PostgreSQL image's user, password, and database name. The values for these image environment variables are set using Compose variables, defined within the .env file:

``` .env
BACKEND_ORDER_PROCESSING_DB_USERNAME=order_processing_app
BACKEND_ORDER_PROCESSING_DB_PASSWORD=«a strong password for the order_processing_app user»
BACKEND_ORDER_PROCESSING_DB_DATABASE=order_processing
```

### Configuring the service
In the backend/order-processing folder, add a file named Dockerfile containing the following content:

``` Dockerfile
# Base

FROM node:12-alpine as base

EXPOSE 8083

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm ci && npm cache clean --force

ENV PATH=/app/node_modules/.bin:$PATH


# Development

FROM base as dev

ENV NODE_ENV=development

WORKDIR /app

RUN npm install --only=development

CMD ["nodemon", "./bin/www"]


# Production

FROM base as prod

WORKDIR /app

COPY . .

CMD ["node", "./bin/www"]
```

The contents of this file is identical to the Dockerfile for the catalog-management service, with the following exceptions:

The EXPOSE command is used to document that the Express application will be listening on port 8083 (instead of 8081).
The CMD commands (in the dev and prod images) have been updated to reflect that the application's entry point is ./bin/www (instead of ./app.js).
Be sure to add a .dockerignore file (in the backend/order-processing folder) with the following content:

``` .dockerignore
.git
*Dockerfile*
*docker-compose*
node_modules
```

In the docker-compose.yml file, add the following content to configure the order-processing service:

``` yml
order-processing:
  build:
    context: ./backend/order-processing
    target: dev
  volumes:
    - ./backend/order-processing:/app:delegated
    - /app/node_modules
  environment:
    - PORT=${BACKEND_ORDER_PROCESSING_PORT}
    - DB_USERNAME=${BACKEND_ORDER_PROCESSING_DB_USERNAME}
    - DB_PASSWORD=${BACKEND_ORDER_PROCESSING_DB_PASSWORD}
    - DB_DATABASE=${BACKEND_ORDER_PROCESSING_DB_DATABASE}
    - DB_HOST=order-processing-db
  depends_on:
    - order-processing-db
```

And in the .env file, define the following variable:

``` .env
BACKEND_ORDER_PROCESSING_PORT=8083
```
A lot of the configuration is the same as the catalog-management service. The environment option is used to configure the additional environment variables (within the container) related to the database. The depends_on option is used to specify that this service has a dependency on the order-processing-db service (which provides the database for the Node/Express application).

Notice that you don't have to use the networks option to define a custom network. By default, each service is added to a default network and services can access each other using each service's name. This is why the DB_HOST environment variable is set to order-processing-db, the name of the PostgreSQL database service for the order-processing service.

Also notice that a port isn't published for the order-processing service. The React client-side UI doesn't access this service directly. Instead, the customer-support service internally accesses the order-processing service to retrieve each customer's list of orders. If you don't need a microservice API to be publicly accessible, then you don't need to publish a port for that service. Other microservices in your application will have access to the service on the default network configured by Compose.

You'll see the configuration for the customer-support service later in this article.

Waiting for a container to fully startup
It's important for the order-processing service to be able to reliably know when the order-processing-db service is ready so that it can run the necessary Sequelize commands to apply migrations and populate the database with seed data.

The depends_on service option allows you to specify that a service has a dependency on another service. Per the Docker Compose documentation, defining a service dependency causes the docker-compose up command to start services in dependency order. In this example, that results in the order-processing-db service being started before the order-processing service.

Unfortunately, configuring the depends_on option doesn't cause Compose to wait until the order-processing-db is ready before starting the order-processing service; Compose only waits until the order-processing-db container has been started. For the order-processing-db service to truly be ready, PostgreSQL needs to be started and listening for database connections.

See the Control Startup and Shutdown Order in Compose article in the official Docker documentation for more information on why Docker doesn't include a built-in option for checking for the availability of service dependencies.

In your local development environment, you can use a wait-for script for services that need to initialize a database. In production, a more sophisticated approach is likely needed to initialize databases (e.g. you might not always want to seed data when bringing a production database online).

Add a file named wait-for to the ./backend/order-processing folder containing the following contents:

``` shell
#!/bin/sh

WAITFOR_TIMEOUT=15
WAITFOR_QUIET=0

echoerr() {
  if [ "$WAITFOR_QUIET" -ne 1 ]; then printf "%s\n" "$*" 1>&2; fi
}

usage() {
  exitcode="$1"
  cat << USAGE >&2
Usage:
  $cmdname host:port [-t timeout] [-- command args]
  -q | --quiet                        Do not output any status messages
  -t TIMEOUT | --timeout=timeout      Timeout in seconds, zero for no timeout
  -- COMMAND ARGS                     Execute command with args after the test finishes
USAGE
  exit "$exitcode"
}

wait_for() {
  for i in `seq $WAITFOR_TIMEOUT` ; do
    nc -z "$WAITFOR_HOST" "$WAITFOR_PORT" > /dev/null 2>&1

    result=$?
    if [ $result -eq 0 ] ; then
      if [ $# -gt 0 ] ; then
        exec "$@"
      fi
      exit 0
    fi
    sleep 1
  done
  echo "Operation timed out" >&2
  exit 1
}

while [ $# -gt 0 ]
do
  case "$1" in
    *:* )
    WAITFOR_HOST=$(printf "%s\n" "$1"| cut -d : -f 1)
    WAITFOR_PORT=$(printf "%s\n" "$1"| cut -d : -f 2)
    shift 1
    ;;
    -q | --quiet)
    WAITFOR_QUIET=1
    shift 1
    ;;
    -t)
    WAITFOR_TIMEOUT="$2"
    if [ "$WAITFOR_TIMEOUT" = "" ]; then break; fi
    shift 2
    ;;
    --timeout=*)
    WAITFOR_TIMEOUT="${1#*=}"
    shift 1
    ;;
    --)
    shift
    break
    ;;
    --help)
    usage 0
    ;;
    *)
    echoerr "Unknown argument: $1"
    usage 1
    ;;
  esac
done

if [ "$WAITFOR_HOST" = "" -o "$WAITFOR_PORT" = "" ]; then
  echoerr "Error: you need to provide a host and port to test."
  usage 2
fi

wait_for "$@"
```

From a terminal, browse to the ./backend/order-processing folder and run the command chmod +x wait-for to set the proper permissions on the wait-for file.

Important: *If you're following along, be sure to use the above version of the wait-for script instead of the version that's available on GitHub. The above version prefixes all of the script's variables with WAITFOR_ to avoid an unintended collision with the PORT environment variable. For more information about this issue, see this GitHub pull request*.

Then, in the docker-compose.yml file, add the following command option to the order-processing service:

``` shell
command: ./wait-for order-processing-db:5432 -- npm run db-migrate-seed
```

Now when the application is started using docker-compose up, Compose will execute the wait-for script when starting up the container for the order-processing service. The wait-for script will wait until the order-processing-db service is listenting on port 5432 (the default port that PostgreSQL listens for database connections) before running the command npm run db-migrate-seed.

The db-migrate-seed npm script is defined in the order-processing service's package.json file as sequelize db:migrate && sequelize db:seed:all && nodemon ./bin/www which applies database migrations, seeds the database, and starts the application using nodemon.

For your reference, the docker-compose.yml file should look like this now:

``` yml
version: '3.8'

services:

  catalog-management:
    build:
      context: ./backend/catalog-management
      target: dev
    ports:
      - ${BACKEND_CATALOG_MANAGEMENT_PORT}:${BACKEND_CATALOG_MANAGEMENT_PORT}
    volumes:
      - ./backend/catalog-management:/app:delegated
      - /app/node_modules
    environment:
      - PORT=${BACKEND_CATALOG_MANAGEMENT_PORT}

  order-processing:
    build:
      context: ./backend/order-processing
      target: dev
    volumes:
      - ./backend/order-processing:/app:delegated
      - /app/node_modules
    environment:
      - PORT=${BACKEND_ORDER_PROCESSING_PORT}
      - DB_USERNAME=${BACKEND_ORDER_PROCESSING_DB_USERNAME}
      - DB_PASSWORD=${BACKEND_ORDER_PROCESSING_DB_PASSWORD}
      - DB_DATABASE=${BACKEND_ORDER_PROCESSING_DB_DATABASE}
      - DB_HOST=order-processing-db
    depends_on:
      - order-processing-db
    command: ./wait-for order-processing-db:5432 -- npm run db-migrate-seed

  order-processing-db:
    image: postgres:12.3
    environment:
      - POSTGRES_USER=${BACKEND_ORDER_PROCESSING_DB_USERNAME}
      - POSTGRES_PASSWORD=${BACKEND_ORDER_PROCESSING_DB_PASSWORD}
      - POSTGRES_DB=${BACKEND_ORDER_PROCESSING_DB_DATABASE}
    volumes:
      - order-processing-db-data:/var/lib/postgresql/data

volumes:
  order-processing-db-data:
```

## Testing
To retest the service, run the command ```docker-compose up --build```. Once the wait-for script detects that the order-processing-db service is listening on port 5432, the db-migrate-seed npm script will be executed and generate the following output:
``` shell
order-processing_1     |
order-processing_1     | > order-processing@1.0.0 db-migrate-seed /app
order-processing_1     | > sequelize db:migrate && sequelize db:seed:all && nodemon ./bin/www
order-processing_1     |
order-processing_1     |
order-processing_1     | Sequelize CLI [Node: 12.18.2, CLI: 5.5.1, ORM: 5.21.13]
order-processing_1     |
order-processing_1     | Loaded configuration file "config/database.js".
order-processing_1     | Using environment "development".
order-processing_1     | == 20200623232733-create-order: migrating =======
order-processing_1     | == 20200623232733-create-order: migrated (0.042s)
order-processing_1     |
order-processing_1     |
order-processing_1     | Sequelize CLI [Node: 12.18.2, CLI: 5.5.1, ORM: 5.21.13]
order-processing_1     |
order-processing_1     | Loaded configuration file "config/database.js".
order-processing_1     | Using environment "development".
order-processing_1     | == 20200617233204-test-data: migrating =======
order-processing_1     | == 20200617233204-test-data: migrated (0.041s)
order-processing_1     |
order-processing_1     | [nodemon] 2.0.4
order-processing_1     | [nodemon] to restart at any time, enter `rs`
order-processing_1     | [nodemon] watching path(s): *.*
order-processing_1     | [nodemon] watching extensions: js,mjs,json
order-processing_1     | [nodemon] starting `node ./bin/www`
order-processing_1     | Executing (default): SELECT 1+1 AS result
order-processing_1     | Database connection success! Sequelize is ready to use...
order-processing_1     | Listening on port 8083...
```
Remember that a port wasn't published for the order-processing service so it's not accessible from the host system. To test the service, you could temporarily publish a port (or you could wait until you configure the next service which accesses the order-processing service):

ports:
  - ${BACKEND_ORDER_PROCESSING_PORT}:${BACKEND_ORDER_PROCESSING_PORT}
Now if you rerun the docker-compose up --build command, you'll be able to browse to the following URLs to test the order-processing service:

http://localhost:8083/ - displays a simple welcome message from the service
http://localhost:8083/orders - displays a list of orders
http://localhost:8083/orders/1 - displays a list of orders for the customer with an ID of 1
Don't forget to remove the ports option from the service configuration!

Configuring the last microservice API
The process to configure the last microservice API, the customer-support service, is virtually identical to the process of configuring the order-processing service.

Add a Dockerfile to the ./backend/customer-support folder containing the following contents (only the exposed port number is different from the order-processing Dockerfile):

``` Dockerfile
# Base

FROM node:12-alpine as base

EXPOSE 8082

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm ci && npm cache clean --force

ENV PATH=/app/node_modules/.bin:$PATH


# Development

FROM base as dev

ENV NODE_ENV=development

WORKDIR /app

RUN npm install --only=development

CMD ["nodemon", "./bin/www"]


# Production

FROM base as prod

WORKDIR /app

COPY . .

CMD ["node", "./bin/www"]
```

Add a .dockerignore file to the same folder:

``` shell
.git
*Dockerfile*
*docker-compose*
node_modules
```

Add a wait-for script to the same folder and run the command ```chmod +x wait-for``` to set the proper permissions.

Then, in the docker-compose.yml file, define the customer-support application and customer-support-db database services along with a top-level volume named customer-support-db-data:

``` yml
version: '3.8'

services:

  # Other services omitted for brevity

  customer-support:
    build:
      context: ./backend/customer-support
      target: dev
    ports:
      - ${BACKEND_CUSTOMER_SUPPORT_PORT}:${BACKEND_CUSTOMER_SUPPORT_PORT}
    volumes:
      - ./backend/customer-support:/app:delegated
      - /app/node_modules
    environment:
      - PORT=${BACKEND_CUSTOMER_SUPPORT_PORT}
      - DB_USERNAME=${BACKEND_CUSTOMER_SUPPORT_DB_USERNAME}
      - DB_PASSWORD=${BACKEND_CUSTOMER_SUPPORT_DB_PASSWORD}
      - DB_DATABASE=${BACKEND_CUSTOMER_SUPPORT_DB_DATABASE}
      - DB_HOST=customer-support-db
      - ORDER_PROCESSING_BASE_URL=http://order-processing:${BACKEND_ORDER_PROCESSING_PORT}
    depends_on:
      - customer-support-db
    command: ./wait-for customer-support-db:5432 -- npm run db-migrate-seed

  customer-support-db:
    image: postgres:12.3
    environment:
      - POSTGRES_USER=${BACKEND_CUSTOMER_SUPPORT_DB_USERNAME}
      - POSTGRES_PASSWORD=${BACKEND_CUSTOMER_SUPPORT_DB_PASSWORD}
      - POSTGRES_DB=${BACKEND_CUSTOMER_SUPPORT_DB_DATABASE}
    volumes:
      - customer-support-db-data:/var/lib/postgresql/data

volumes:
  customer-support-db-data:
  order-processing-db-data:
```

And lastly, add the following variables to the .env file:

``` .env
BACKEND_CUSTOMER_SUPPORT_PORT=8082
BACKEND_CUSTOMER_SUPPORT_DB_USERNAME=customer_support_app
BACKEND_CUSTOMER_SUPPORT_DB_PASSWORD=«a strong password for the customer_support_app user»
BACKEND_CUSTOMER_SUPPORT_DB_DATABASE=customer_support
```

Calling a service from another service
You might have noticed that the customer-support service defines an additional environment variable ORDER_PROCESSING_BASE_URL:

environment:
  - PORT=${BACKEND_CUSTOMER_SUPPORT_PORT}
  - DB_USERNAME=${BACKEND_CUSTOMER_SUPPORT_DB_USERNAME}
  - DB_PASSWORD=${BACKEND_CUSTOMER_SUPPORT_DB_PASSWORD}
  - DB_DATABASE=${BACKEND_CUSTOMER_SUPPORT_DB_DATABASE}
  - DB_HOST=customer-support-db
  - ORDER_PROCESSING_BASE_URL=http://order-processing:${BACKEND_ORDER_PROCESSING_PORT}
The ORDER_PROCESSING_BASE_URL environment variable is used to specify the base URL for the order-processing microservice API, which is used in the app.js file to retrieve each cutomer's orders:

``` .js
// ./backend/customer-support/app.js

const { map } = require('p-iteration');

// Code removed for brevity

app.get('/customers', asyncHandler(async (req, res) => {
  const customers = await db.Customer.findAll({ order: [['name', 'ASC']] });

  const customersWithOrders = await map(customers, async (customer) => {
    const result = await fetch(`${orderProcessingBaseUrl}/orders/${customer.id}`);
    const data = await result.json();
    return {
      id: customer.id,
      name: customer.name,
      orders: data.orders,
    };
  });

  res.json({ customers: customersWithOrders });
}));
```

In the above code example, the p-iteration npm package's map method is used to asynchronously iterate over the list of customers. Attempting to use the await keyword inside of a loop without using a package like p-iteration can result in unexpected results.

## Testing
To retest the service, run the command ```docker-compose up --build```. Browse to the URL http://localhost:8082/customers to retrieve a list of customers and their orders.

Preventing services from accessing resources
Currently, every service defined in the docker-compose.yml file is using the default network. While this works, every service has the ability to access any other service. For this application, the database services, customer-support-db and order-processing-db, only need to be accessible by their respective application services, customer-support and order-processing.

To prevent a microservice from expectedly accessing a database that it shouldn't access, you can use the top-level networks option to configure two custom networks:
``` yml
networks:
  customer-support:
    driver: bridge
  order-processing:
    driver: bridge
```
After defining the custom networks, you can use the networks option underneath a service definition to specify the networks that the service should be added to:

``` yml
  order-processing:
    # Other options removed for brevity
    networks:
      default:
      order-processing:

  order-processing-db:
    # Other options removed for brevity
    networks:
      order-processing:
```
In the above example, the order-processing service has been added to the default and order-processing networks and the order-processing-db service as only been added to the order-processing network. Not adding the order-processing-db service to the default network prevents other microservices from being able to access it.

Notice that you need to explicitly add the default network to the networks option when configuring a service's networks.

Here's an updated docker-compose.yml file that defines custom networks for the customer-support and order-processing services so that they can privately communicate with their database services:

``` yml
version: '3.8'

services:

  catalog-management:
    build:
      context: ./backend/catalog-management
      target: dev
    ports:
      - ${BACKEND_CATALOG_MANAGEMENT_PORT}:${BACKEND_CATALOG_MANAGEMENT_PORT}
    volumes:
      - ./backend/catalog-management:/app:delegated
      - /app/node_modules
    environment:
      - PORT=${BACKEND_CATALOG_MANAGEMENT_PORT}

  customer-support:
    build:
      context: ./backend/customer-support
      target: dev
    ports:
      - ${BACKEND_CUSTOMER_SUPPORT_PORT}:${BACKEND_CUSTOMER_SUPPORT_PORT}
    networks:
      default:
      customer-support:
    volumes:
      - ./backend/customer-support:/app:delegated
      - /app/node_modules
    environment:
      - PORT=${BACKEND_CUSTOMER_SUPPORT_PORT}
      - DB_USERNAME=${BACKEND_CUSTOMER_SUPPORT_DB_USERNAME}
      - DB_PASSWORD=${BACKEND_CUSTOMER_SUPPORT_DB_PASSWORD}
      - DB_DATABASE=${BACKEND_CUSTOMER_SUPPORT_DB_DATABASE}
      - DB_HOST=customer-support-db
      - ORDER_PROCESSING_BASE_URL=http://order-processing:${BACKEND_ORDER_PROCESSING_PORT}
    depends_on:
      - customer-support-db
    command: ./wait-for customer-support-db:5432 -- npm run db-migrate-seed

  customer-support-db:
    image: postgres:12.3
    environment:
      - POSTGRES_USER=${BACKEND_CUSTOMER_SUPPORT_DB_USERNAME}
      - POSTGRES_PASSWORD=${BACKEND_CUSTOMER_SUPPORT_DB_PASSWORD}
      - POSTGRES_DB=${BACKEND_CUSTOMER_SUPPORT_DB_DATABASE}
    networks:
      customer-support:
    volumes:
      - customer-support-db-data:/var/lib/postgresql/data

  order-processing:
    build:
      context: ./backend/order-processing
      target: dev
    networks:
      default:
      order-processing:
    volumes:
      - ./backend/order-processing:/app:delegated
      - /app/node_modules
    environment:
      - PORT=${BACKEND_ORDER_PROCESSING_PORT}
      - DB_USERNAME=${BACKEND_ORDER_PROCESSING_DB_USERNAME}
      - DB_PASSWORD=${BACKEND_ORDER_PROCESSING_DB_PASSWORD}
      - DB_DATABASE=${BACKEND_ORDER_PROCESSING_DB_DATABASE}
      - DB_HOST=order-processing-db
    depends_on:
      - order-processing-db
    command: ./wait-for order-processing-db:5432 -- npm run db-migrate-seed

  order-processing-db:
    image: postgres:12.3
    environment:
      - POSTGRES_USER=${BACKEND_ORDER_PROCESSING_DB_USERNAME}
      - POSTGRES_PASSWORD=${BACKEND_ORDER_PROCESSING_DB_PASSWORD}
      - POSTGRES_DB=${BACKEND_ORDER_PROCESSING_DB_DATABASE}
    networks:
      order-processing:
    volumes:
      - order-processing-db-data:/var/lib/postgresql/data

networks:
  customer-support:
    driver: bridge
  order-processing:
    driver: bridge

volumes:
  customer-support-db-data:
  order-processing-db-data:
```

# Configuring the React client-side UI
The last service to configure for the application is the service for the React client-side UI.

## Add a Dockerfile to the ./frontend folder containing the following contents:

``` Dockerfile
# Base

FROM node:12-alpine as base

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm ci && npm cache clean --force

ENV PATH /app/node_modules/.bin:$PATH


# Development

FROM base as dev

ENV NODE_ENV=development

WORKDIR /app

RUN npm install --only=development

CMD ["npm", "start"]


# Build

FROM base as build

# Need to define the env vars for the React app
# so that the build process will have access
# to the values to use for production
ENV REACT_APP_CATALOG_MANAGEMENT_BASE_URL=http://localhost:8081
ENV REACT_APP_CUSTOMER_SUPPORT_BASE_URL=http://localhost:8082

WORKDIR /app

COPY . .

RUN npm run build


# Production

FROM nginx:stable-alpine as prod

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## Add a .dockerignore file to the same folder:

.git
*Dockerfile*
*docker-compose*
node_modules

## build
The base and dev stages are very similar to what was used in the Node/Express Dockerfiles. The third and fourth stages, build and prod, are used respectively to create a production build of the React application and to serve the static build assets using Nginx.

Then, add the frontend service to the docker-compose.yml file:

``` yml
frontend:
  build:
    context: ./frontend
    target: dev
  volumes:
    - ./frontend:/app:delegated
    - /app/node_modules
  ports:
    - ${FRONTEND_PORT}:3000
  environment:
    - REACT_APP_CATALOG_MANAGEMENT_BASE_URL=http://localhost:${BACKEND_CATALOG_MANAGEMENT_PORT}
    - REACT_APP_CUSTOMER_SUPPORT_BASE_URL=http://localhost:${BACKEND_CUSTOMER_SUPPORT_PORT}
  stdin_open: true
  depends_on:
    - catalog-management
    - customer-support
```
And in the .env file, define the following variable:

``` .env
FRONTEND_PORT=3000
```

The only service option that you haven't seen yet, is the stdin_open option (which maps to its docker run counterpart), which is being used as a bit of a hack to keep the container for the frontend service from exiting after it has been started. When running the application in foreground mode (i.e. not detached using the -d flag), setting the stdin_open option to true attaches the container process's standard in (STDIN) to the console. Doing this keeps the container from exiting when using the Create React App tooling.

# Testing
Now you're ready to do a final test of the application. Run the command docker-compose up --build and browse to the URL http://localhost:3000/. You should see the React UI displayed (your random data will vary but the overall UI should look the same):

microservices-online-ordering-application-ui

The Create React App tooling is being used in the container for the frontend service, which allows you to make a change to the React application (i.e. edit the code for a UI component) and the process running within the container will detect the change, rebuild the React application, and refresh your page in the browser.

Remember that in the React application, the Fetch API is used to interact with the microservice APIs, which happens in the client (i.e. the browser) not in a container. Because of that, the frontend service doesn't need to internally interact with any of the other services. The React application interacts with the microservice APIs using nothing but the public interface of the application (i.e. the published ports configured in the Compose file).
