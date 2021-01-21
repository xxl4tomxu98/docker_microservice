# Flask/Postgres Docker

This README includes information on the current `Dockerfile` and
`docker-compose.yml` file for the Flask/Postgres application.

## Old Dockerfile

```yml
# Copy project package requirements and bash script with Flask migration/start scripts
COPY ./requirements.txt /app/requirements.txt

# Unneeded flags for pip3 install
# --trusted-host=pypi.python.org --trusted-host=pypi.org --trusted-host=files.pythonhosted.org
# --user

# Moved command into the `/app/entrypoint.sh` file
# The package installation command works on the 2nd build, but not on the 1st
RUN pip3 install -r /app/requirements.txt
```

## Old Docker-Compose file

```yml
# Tested commands before use of `./entrypoint.sh` script
command: ["./wait-for", "postgres:5432", "-t", "60", "--", "python3", "book_ratings.py", "db", "upgrade", "--", "python3", "book_ratings.py", "run", "-h", "0.0.0.0"]
command: ["./wait-for", "postgres:5432", "-t", "60", "--", "python3", "book_ratings.py", "run", "-h", "0.0.0.0"]

# Tested commands that time out
command: ["./wait-for", "postgres:5432", "--", "./entrypoint.sh"]
command: ["./wait-for", "postgres:5432", "--", "python3", "book_ratings.py", "run", "-h", "0.0.0.0"]

# Tested commands that log `Running on http://127.0.0.1:5000/` but don't work
command: ["python3", "book_ratings.py", "run"]
command: ["python3", "book_ratings.py", "run", "-h", "127.0.0.1"]

# Works! But this command was moved over into the `./entrypoint.sh` script run from the Dockerfile `CMD`
command: ["python3", "book_ratings.py", "run", "-h", "0.0.0.0"]

# Volume was overwriting the application files
# Removal of the volume was inspired by this issue: https://github.com/testdrivenio/testdriven-app/issues/25#issuecomment-360651558
# volumes:
#   - .:/app
# Added volume back in and removed copying of application files in the Dockerfile
```