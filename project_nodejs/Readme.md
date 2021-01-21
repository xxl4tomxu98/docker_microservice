Dockerize an Express and Postgres Application
For this phase, you'll create a docker-compose.yml file for a simple Express and Postgres app. Download the skeleton and you can see the application. Notice how you have a full Express application as well as a db directory with model, migration, and seed files. You can Dockerize this container in at least two ways:

Local development: mount a volume in the container. You would bind mount a host path to the application by setting a volumes key with a value of .:/app in the docker-compose.yml file. This maps a local directory to the container so all the source code (including node_modules) stays on the local file system. As a reminder, you can use the volumes option to both configure a "bind mount" and a "volume". The term "volume" has a very specific meaning in Docker so you should only use it when referring to a named volume.
Non-local development: copy application files into custom image. You would use COPY . /app in the Dockerfile. Every time you change the source code for the application, you’d need to rebuild the containers.
Phase 1: Dockerize an Express/Postgres app for local development
Today, you'll create a docker-compose.yml file with local development in mind. You'll configure a bind mount in the container so all the source code stays on the local file system. For this app, you’ll create two services: one service named app for the Express application, and one service named db for the PostgreSQL database.

You've already been provided with the Dockerfile for the custom node image you'll be creating. Take a moment to check out the file and notice how it simply sets the working directory and exposes the 8080 port.

Compose file
For this Compose file, set your version to '3.8'. Create two services: app, for your Express application, and db, for your Postgres database. Start by filling out the Postgres db service.

Set your image for the db service to be postgres:12-alpine. You'll need to set the environment variables expected by the image to create the database user and database. Take a look at the official Postgres image documentation on Docker Hub to determine how to set up the Postgres image. Scroll down to the How to extend this image section and take a look at the environment variables expected in configuration:

POSTGRES_PASSWORD This environment variable is required for you to use the PostgreSQL image. It must not be empty or undefined. This environment variable sets the superuser password for PostgreSQL. The default superuser is defined by the POSTGRES_USER environment variable.

POSTGRES_USER This optional environment variable is used in conjunction with POSTGRES_PASSWORD to set a user and its password. This variable will create the specified user with superuser power and a database with the same name. If it is not specified, then the default user of postgres will be used.

POSTGRES_DB This optional environment variable can be used to define a different name for the default database that is created when the image is first started. If it is not specified, then the value of POSTGRES_USER will be used.

Notice how the documentation states which environment variables are required and which are optional. Since you configured the application by creating a database user with a password and a database connected to that user, you'll need to set the POSTGRES_USER, POSTGRES_PASSWORD, and POSTGRES_DB so that your Postgres image will create a user and database in a similar fashion.

Use the DB_USERNAME, DB_PASSWORD, DB_DATABASE values set in the .env.example file.

PORT=8080
DB_USERNAME=reading_list_app
DB_PASSWORD=password
DB_DATABASE=reading_list
DB_HOST=localhost
You'll also want to set up a volume for the database so your data persists between using the docker compose up command multiple times. Name your volume postgres-db and have it point to where the Postgres image keeps its volumes /var/lib/postgresql/data. Remember that if you have a named volume, you have to name it outside the service key and under a volumes key. Take a look at the Docker Compose 3 documentation for volumes if you need syntax reference.

Next, you'll want to create a custom network you can reference by name to connect your database and Node app. Just like how your volumes key it outside of your services, you create a new key for networks. Name your custom network "pgnodeapp" and use the default bridge driver. It'll look something like this:

networks:
  pgnodeapp:
    driver: bridge
Now you'll want your db service to connect to your custom network by adding a networks key referencing the named "pgnodeapp" network. You can also alias it as "postgres". Your db service should contain a networks key, like so:

# CODE SHORTENED FOR BREVITY
   db:
      # CODE SHORTENED FOR BREVITY
      networks:
         pgnodeapp:
         aliases:
            - "postgres"
Now let's start building the app service. If you need a reminder on building images with Compose, check out the Docker documentation on the subject. In your app service, build a new image based on the Dockerfile you have been provided. You can do this by using a build key under your app service. The build key takes a path to the build context (i.e. where Compose can find the Dockerfile to use for the build). Instruct the service to build the current path by using .. Your current app service should look something like this:

services:
  app:
    build: .
You can use the image key to name the new image as nodeapp. Now have your Express application run on port 8080 by publishing your local port 80 and using port 8080 in the container. Feel free to reference the ports section of the Docker documentation.

Now you'll connect the app and db services. Your app service will need to be passed environment variables it expects to configure the database connection. Check out the .env.example file and configure your service to set the expected environment variables: DB_USERNAME, DB_PASSWORD, DB_DATABASE, DB_HOST, and NODE_ENV.

Lastly, you'll want mount the local directory for your nodeapp image to reference. This mounts all (.) of the local directory to the image's /app directory.

app:
   # CODE SHORTENED FOR BREVITY
   volumes:
      - ".:/app"
Now let's connect your services together! Connect the app container to the pgnodeapp network. Think of the syntax for how you connected your db service to the pgnodeapp network. Note that you do not need to have an alias for this connection.

Control service startup
In order for your migration and seed commands to run after your database service is fully up and running, you'll need to control the order of service startup by using the depends_on option and an open source project, wait-for. This is a common issue with a best-practice approach to control startup and shutdown order in Compose, as documented in the official Docker docs. Take a moment to read about the common problem.

Let's follow this best practice approach by adding a depends_on key to the app service. Have the app service depend on the db service.

Next, you'll have your app service run the npm run build-start command after waiting for the Postgres database to be set up. Take a moment to check out the build-start script viewing the project's package.json file. Notice how the built-start script runs npm install as well as the custom migrate and seed scripts that take care of running Sequelize commands to set up your database.

In order to have your container run the npm run build-start command after the Postgres database is set up, you'll need the container to run a wait-for script beforehand. Notice how you have a wait-for file in the root of the project directory. This wait-for file is an open-source project to synchronize services.

Note the example command listed in the project repository's README: command: sh -c './wait-for db:5432 -- npm start'.

Also note the example command listed in the Docker docs: command: ["./wait-for-it.sh", "db:5432", "--", "python", "app.py"].

Use these two examples to build your command that:

Runs the ./wait-for script
Connects the postgres database to local host (5432)
Runs the npm run build-start command
After you have set up your app service's command, be sure to set the execute permissions for the wait-for script by running chmod +x wait-for. Then, start your containers in with docker-compose up and view your running containers in another tab with docker-compose ps.

Reminder: you'll need to use the docker-compose up --build command with the --build flag whenever you make changes to any Dockerfiles or the docker-compose.yml file.

    Name                  Command               State          Ports
----------------------------------------------------------------------------
phase2_app_1   docker-entrypoint.sh ./wai ...   Up      0.0.0.0:80->8080/tcp
phase2_db_1    docker-entrypoint.sh postgres    Up      5432/tcp
Head to http://0.0.0.0:80 and you should see your Reading List application running. Browse around and create a couple of books! You should be able to refresh and your books should stay right where they are, even if you empty the browser cache and do a hard reload.

To test that your named volume was installed properly, use docker-compose down and then use docker-compose up again. The books you created should still exist, and your application should be rendering duplicate books because the same Postgres database was seeded again when the npm run build-start command ran again in the second docker-compose up.

Reminder: you'll need to use the docker-compose up --build command with the --build flag whenever you make changes to any Dockerfiles or the docker-compose.yml file.

Amazing job! What you just accomplished in this phase is considered to be relatively advanced Docker stuff. Now you are ready to use your Docker container for local development!

Phase 2: Create a Microservice
In this phase, you'll create a microservice with Flask and Postgres. Begin by initializing a virtual environment and using Pipenv to install the following dependencies.

flask
flask-sqlalchemy
alembic
flask-migrate
python-dotenv
psycopg2-binary
sqlalchemy
Now let's create a database and database user. Later, you'll use a Flask-Migrate command to generate tables in the database.

CREATE USER ratings_user WITH CREATEDB PASSWORD 'password';
CREATE DATABASE ratings WITH OWNER ratings_user;
Create an entry book_ratings.py file in the root of the project directory. Then, take a moment to set your FLASK_APP, FLASK_ENV, and DATABASE_URL environment variables.

Create a .flaskenv file for your FLASK_APP environment variable. You'll want to create a .env file and set your private FLASK_ENV and DATABASE_URL variables.

Set up Flask
Now it's time to create your microservice with a simple Flask app! Begin by creating an app directory with an __init__.py file, a config.py file, and a models.py file.

Begin by setting up your application's config.py file. Define a Configuration class to set the SQLALCHEMY_DATABASE_URI and SQLALCHEMY_TRACK_MODIFICATIONS options. In your models.py file, use the SQLAlchemy function from the flask_sqlalchemy package to initialize a db.

Next, you'll create your Flask application and define API endpoints in the __init__.py file. Take a moment to configure your application. Make sure to connect the database to your application and apply Flask-Migrate to your application and database.

Lastly, you'll import your initialized Flask app into the book_ratings.py file. Create a test route for the / path and start your application with pipenv run flask run to make sure you are set up.

Set up models and migrations
Take a moment to initialize the local Alembic environment by running pipenv run flask db init. Now if you open your project directory, you'll see a new migrations folder and Alembic files within. Create a Rating model in your Flask app and a book_ratings table in your database with the following specifications.

Column name	Data type	Constraints
id	INTEGER	Primary key
book_id	INTEGER	not null
value	INTEGER	not null
email	VARCHAR(255)	not null
You'll also want to add a composite index by using SQLAlchemy's Index API. You'll create this index so that each user can only rate a book once. Name the index only_one_book_rating_per_user and have it reference the book_id and email columns. Make sure the pair of columns is unique. Since you are using your index as a table-level constraint, you'll need to define it using the table_args attribute.

Now that your Rating model is all set up, you can create and run a migration to set up your book_ratings table:

pipenv run flask db migrate -m "create book_ratings table"
pipenv run flask db upgrade
Take a moment to check that your migrations were successful by viewing the tables in your ratings database. Now you are ready to define the two routes for your Book Ratings microservice!

GET "/ratings/\<int:book_id>"
Create a route to handle a GET request to fetch a book's ratings. In that route, have the route query all the ratings of a specific book by filtering the ratings with a matching book_id from the route parameters. If no ratings are found, return a 'No ratings for this book yet.' error response in JSON with an appropriate status code.

Otherwise, calculate the book's average_rating and round the average to two decimal places. Take a moment to filter what rating attributes you want and don't want to render in JSON. Append the attributes you want to render to a list named rating_values. The rating_values list should consist of dictionaries representing each Rating entity in the database associated to a book.

Since you are creating an API microservice, you'll want the route to return a JSON response with the book's average_rating and rating_values. Use the jsonify function to return a JSON response. Take a moment to seed some rating information into your database before testing your route.

INSERT INTO book_ratings (book_id, value, email)
VALUES
(1, 10, 'jane@email.com'),
(1, 8, 'stephon@email.com'),
(1, 5, 'milo@email.com'),
(2, 4, 'andrew@email.com'),
(2, 6, 'julia@email.com'),
(3, 7, 'erik@email.com');
Now you can visit the endpoint with your browser at http://localhost:5000/ratings/1 or send a GET request with Postman to check if your route is successfully fetching and rendering database ratings! Your JSON response should look something like this:

{
  "average": 7.67,
  "ratings": [
    {
      "value": 10
    },
    {
      "value": 8
    },
    {
      "value": 5
    }
  ]
}
POST "/ratings/\<int:book_id>"
Create a route to handle a POST request to create a new book rating. For this route, you'll be using the request.args dictionary to access the route parameters. Take a moment to import request from flask to gain access to the request object.

Have the route return 'Bad data' as a JSON error response if request.args is falsy. Then, check if request.args includes the attributes you need to create a new book rating. If request.args is missing arguments to initialize a new Rating entity, you'll want to return an error response (i.e. 'Missing arguments').

Now you can try to create a new rating. Just like how you might code an object literal in JavaScript to prototype a new database entity, you'll code a new_rating dictionary that prototypes a new Rating and its attributes. Think of how you might set the id of the rating.

As a reminder, you can get a value from the request.args dictionary based off of its key. All the values of the request.args dictionary are type string, so don't forget to convert your book_id and value from strings to integers. Instead of accessing book_id from the request.args dictionary, you can also access the integer book_id parameter that is passed into the route and indicated by <int:book_id> in the route.

You can instantiate a new Rating by passing in the new_rating dictionary as keyword arguments by using the ** syntax that prefaces **kwargs. After that, add the new rating to your database session and commit the update. Then jsonify the new_rating and return the new_rating dictionary as the endpoint's JSON response.

In the except block, catch the sqlalchemy.exc.IntegrityError and alias it as e. Print the error and have your route return the JSON error response: 'Each user can only submit one rating per book.' To keep your code organized, you can import IntegrityError from sqlalchemy.exc at the top of your __init__.py file and catch the imported IntegrityError instead of sqlalchemy.exc.IntegrityError.

Test your route with Postman by sending a POST request to http://localhost:5000/ratings/1?value=8&email=ryan@email.com. Notice the value and email parameters listed in the URL. You should have received a JSON response that looks something like this:

{
  "book_id": 1,
  "email": "ryan@email.com",
  "id": 7,
  "value": 8
}
Now try to send another POST request with the same email: http://localhost:5000/ratings/1?value=1&email=ryan@email.com. You should have received the response 'Each user can only submit one rating per book.'.

Whitelist local host access
The last thing you'll want to do is whitelist your API so only one IP address can access the service. Your service should only be accessible by the local host. You can whitelist local host access by using the @app.before_request decorator. As a reminder localhost is just the default name that describes your local IP address, 127.0.0.1.

Use the request.remote_addr property to check whether the request is coming from the local IP address. If it is not coming from the local IP address, use the flask.abort function to raise an HTTPException for a request forbidden status of 403.

Now your API is whitelisted for local host access, so it is only be accessible from the local 127.0.0.1 IP address. Before every request, the decorated function that aborts non-local requests will run.

Create the Dockerfile
Now it's time to dockerize the microservice! You'll dockerize the Flask/Postgres microservice in a very similar way to how you dockerized the Express/Postgres application. You can even begin by copying over the Dockerfile and docker-compose.yml file from your Express app. Let's begin by working off of the Dockerfile that creates your custom Node image.

Dockerfile

FROM node:12-alpine

WORKDIR /app

EXPOSE 8080
Have the Dockerfile for your Flask application use the python image with a tag of 3.8-slim. Then, update the exposed port to 5000. Take a moment to create a requirements.txt file based on the current dependencies in your Pipfile. You can do this by running pip3 freeze > requirements.txt. This will automatically generate a requirements.txt file that lists all the installed dependencies, along with their current version. Now add a COPY state in your Dockerfile to copy the requirements.txt file in the local project directory into the container's /app directory.

COPY ./entrypoint.sh /app/entrypoint.sh
You'll want to create a entrypoint.sh helper script that will be run from within the Docker container. It will take care of installing your dependencies, migrating the book ratings table into your container's Postgres database, and starting your Flask application. By convention, the helper script should be named entrypoint.sh. Have the first line of the file be #!/usr/bin/env bash to indicate that you are writing a bash script. Then, add the following pip3 command to install all packages listed in the copied /app/requirements.txt file.

#!/usr/bin/env bash
pip3 install -r /app/requirements.txt
You'll want to RUN the following command to set permissions and allow the copied entrypoint.sh script file to be run from within the container.

RUN chmod +x /app/entrypoint.sh
You can also add the db upgrade command to handle your database migrations. But first, you'll want to be able to do so by prefacing the command with python3 and your entry book_ratings.py file, instead of pipenv run flask. This way, you won't need to set the PATH variable that allows you to run flask in a command.

As of now, your book_ratings.py file is simply importing the app from the /app directory. You'll want to update the file to import FlaskGroup to configure the Flask command line interface. Create a new FlaskGroup instance to extend the commands connected to the Flask app. Python assigns the __name__ dunder to the string "__main__" whenever a script is executed. You'll run the book_ratings.py lika script file, therefore assigning the __name__ dunder to be "__main__". When the file is run as a Python script, you'll want to initialize a CLI connection.

from flask.cli import FlaskGroup
from app import app

cli = FlaskGroup(app)

if __name__ == "__main__":
    cli()
Add the updated python3 commands to migrate your database and start your application. Notice how your application is started by running the book_ratings.py file as a Python script file, instead of using the pipenv run flask run Flask command. You'll use run -h 0.0.0.0 to assign the host of the application.

#!/usr/bin/env bash
pip3 install -r /app/requirements.txt
python3 book_ratings.py db upgrade
python3 book_ratings.py run -h 0.0.0.0
Create the Docker-Compose file
Now that you've finished setting up your microservice's package installation, application setup, and Dockerfile to generate a custom Python image, it's time to create the docker-compose.yml file! Begin by modeling the file based on the compose file you created for the Express application.

docker-compose.yml

version: "3.8"
services:
  app:
    build: .
    image: nodeapp
    ports:
      - "80:8080"
    environment:
      DB_USERNAME: reading_list_app
      DB_PASSWORD: password
      DB_DATABASE: reading_list
      DB_HOST: postgres
      NODE_ENV: development
    networks:
      pgnodeapp:
    volumes:
      - ".:/app"
    depends_on:
      - "db"
    command: ["./wait-for", "postgres:5432", "--", "npm", "run", "build-start"]

  db:
    image: postgres:12-alpine
    environment:
      POSTGRES_USER: reading_list_app
      POSTGRES_PASSWORD: password
      POSTGRES_DB: reading_list
    volumes:
      - postgres-db:/var/lib/postgresql/data
    networks:
      pgnodeapp:
        aliases:
          - "postgres"

volumes:
  postgres-db:

networks:
  pgnodeapp:
    driver: bridge
Let's begin by updating the network name. Rename the pgnodeapp network, since you are no longer creating a network for a Node application.

Next, update the app service to be an api service based on the custom Python image you just created with the Dockerfile. In the api service, name the custom image to be flaskapp instead, and publish port 5000 while listening on port 5000. Update the environment variables to the variables expected by your Flask application.

Since you are Dockerizing the Flask microservice for local development, you can keep the volume that bind mounts the application files. This way, whenever a file changes locally, a running application in a container will reflect those changes. You'll also want the api service to depend on the db service. Since you added your package installation, database migration, and application start commands into the entrypoint.sh script file, run the file in the api service's command so that those shell commands are run within the container.

For your db service, all you'll need to do is update the environment variables expected to set up the PostgreSQL database. Use the values from your Flask application's database URI.

Take a moment to build your custom image and start your container by running docker-compose up --build. Then, visit http://0.0.0.0:5000/ in the browser to send a GET request to the dockerized API service. You should receive a 403 Forbidden response because of the @app.before_request decorator where requests from the local host are whitelisted. The request.remote_addr from your browser's host does not match the local host within the container. For now, comment out the whitelist function and refresh your browser. Now you should see your test route response!

Take a moment to use Postman and test your dockerized service by sending GET and POST request for book ratings. After you've thoroughly tested the dockerized Flask app, comment in the @app.before_request whitelist function and move forward to the next phase to implement the microservice!

Phase 3: Implement the microservice
It's time to implement the microservice you created with Flask into your Express app! Create a book show page that renders a book's details and ratings, using the microservice. Then, implement a form that sends a POST request to the microservice to allow a user to create a book rating.

Think about how you might reference your Flask microservice endpoints, before the microservice is deployed and from within your Dockerized development environment. You'll want to connect the containerized Express application to a service on the host. Take a look at the networking features in Docker. Think of how you might use the special DNS name, host.docker.internal, to send a request from your Express application to your Flask microservice.

You'll also want to take a look at the @app.before_request decorator where requests from the local host are whitelisted. Since the request will come from within a containerized application, the request.remote_addr may not be the local 127.0.0.1 IP address. You actually want to whitelist all requests from within your containerized Express application. Think of how else you can whitelist specific requests. Take a look at the flask.request documentation. Browse the request object's properties and think of how you can check whether the special DNS name, host.docker.internal, is associated to an incoming request.
