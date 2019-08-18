# Tripper-app-api
**Tripper** is a web application that aims to help users arrange trip budget before or during the trip. This repo is the **backend** part of the entire app. Handle the server and database working. Built with **Node.js**, **Express.js** and **Knex.js**. The database used is **PostgreSQL**. The project is deployed to **[Heroku]()**.

## Getting Started
These instructions will get you a copy of the project up and running on your local machine.

### Prerequisites
You will need to install **Node.js & npm & PostgreSQL** for this code base.
 
### Installing
 Script to install the packages:
```
npm install
```
> Notes: This project uses [bcrypt-node.js](https://www.npmjs.com/package/bcrypt-nodejs) library to encrypt user password.

Script to start the project: 
```
npm start
```
> This script will run "nodemon server.js", help monitoring the server running. 

## Built with

- Use **Node.js** and **Express.js** to build server.
- Use **Knex.js** to interact with database. 
- Use **PostgreSQL** to build relational database.

## Related

- [Tripper-app](https://github.com/chinyun/Tripper-app)
The front-end of Tripper app.
- [Tripper-app-redux](https://github.com/chinyun/Tripper-app-redux)
Add Redux to manage state.
