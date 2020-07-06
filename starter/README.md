
# Microservices Online Catalog (without Docker)

To get the non-Docker version of the application up and running within your
local development environment, all of the following steps need to be completed:

* Add `.env` files to the `backend/customer-support`,
  `backend/order-processing`, and `frontend` folders (based upon the available
  `.env.example` files within each of those folders).

* Create the `customer_support` and `order_processing` databases as well as
  their respective users `customer_support_app` and `order_processing_app` using
  the following SQL statements:

```sql
create database customer_support;
create user customer_support_app with encrypted password '«the customer_support_app user password»';
grant all privileges on database customer_support to customer_support_app;
```

```sql
create database order_processing;
create user order_processing_app with encrypted password '«the order_processing_app user password»';
grant all privileges on database order_processing to order_processing_app;
```

* In the `backend/catalog-management` folder, install the sub-project's
  dependencies by running the command `npm install` and run the command `npm
  start` to start the application.

* In the `backend/customer-support` folder, install the sub-project's
  dependencies by running the command `npm install`, apply the Sequelize
  migrations and seed data by running the commands `npx dotenv sequelize
  db:migrate` and `npx dotenv sequelize db:seed:all`, and run the command `npm
  start` to start the application.

* In the `backend/order-processing` folder, install the sub-project's
  dependencies by running the command `npm install`, apply the Sequelize
  migrations and seed data by running the commands `npx dotenv sequelize
  db:migrate` and `npx dotenv sequelize db:seed:all`, and run the command `npm
  start` to start the application.

* In the `frontend` folder, install the sub-project's dependencies by running
  the command `npm install` and run the command `npm start` to start the
  application.

Whew! And these instructions assume that you have the correct versions of Node,
npm, and PostgreSQL installed on your system!

After completing the above steps, you'll have four terminal windows open:

![microservices-without-docker]

Now you can browse to `http://localhost:3000/` to view the client-side UI:

![microservices-online-ordering-application-ui]

[microservices-without-docker]: https://appacademy-open-assets.s3-us-west-1.amazonaws.com/Modular-Curriculum/content/microservices/topics/design/assets/microservices-without-docker.png

[microservices-online-ordering-application-ui]: https://appacademy-open-assets.s3-us-west-1.amazonaws.com/Modular-Curriculum/content/microservices/topics/design/assets/microservices-online-ordering-application-ui.png
