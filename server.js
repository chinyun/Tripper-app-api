const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const pg = require('pg');

const signin = require('./controllers/signin');
const register = require('./controllers/register');
const journeys = require('./controllers/journeys');
const accounts = require('./controllers/accounts');
const expenses = require('./controllers/expenses');

const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  }
});

const app = express();

app.use( cors() );
app.use( bodyParser.json() );

app.get('/', (req, res) => { res.send('getting root') });

app.post('/signin', (req, res) => { signin.handleSignin(req, res, db, bcrypt) });
app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) });

app.post('/journeys', (req, res) => { journeys.handlePostJourney(req, res, db) });
app.patch('/journeys/:id', (req, res) => { journeys.handlePatchJourney(req, res, db) });
app.patch('/journeys_budgets/:id', (req, res) => { journeys.handlePatchBudget(req, res, db) });
app.delete('/journeys/:id', (req, res) => { journeys.handleDeleteJourney(req, res, db) });

app.post('/accounts', (req, res) => { accounts.handlePostAccount(req, res, db) });
app.delete('/accounts/:id', (req, res) => { accounts.handleDeleteAccount(req, res, db) });

app.post('/expenses', (req, res) => { expenses.handlePostExpense(req, res, db) });
app.patch('/expenses/:id', (req, res) => { expenses.handlePatchExpense(req, res, db) });
app.delete('/expenses/:id', (req, res) => { expenses.handleDeleteExpense(req, res, db) });

app.listen( process.env.PORT || 3000, () => {
	console.log(`app is running on port ${process.env.PORT}`);
})
