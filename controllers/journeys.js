const components = require('./components');

const handlePostJourney = (req, res, db) => {
  db.select('id').from('users')
    .where('id', '=', req.body.user_id)
    .then(userId => {
      db.transaction(trx => {
        trx.insert({
          name: req.body.name,
          budget: req.body.budget,
          expense: req.body.expense,
          traffic_budget: req.body.traffic_budget,
          food_budget: req.body.food_budget,
          living_budget: req.body.living_budget,
          ticket_budget: req.body.ticket_budget,
          shopping_budget: req.body.shopping_budget,
          user_id: req.body.user_id,
          traffic_expense: 0,
          food_expense: 0,
          living_expense: 0,
          ticket_expense: 0,
          shopping_expense: 0
        })
        .into('journeys')
        .returning('id')
        .then(journeyId=> {
          return trx('accounts')
            .returning('*')
            .insert({
              journey_id: journeyId[0],
              name: 'Day1',
              total_amount: 0,
              traffic_amount: 0,
              food_amount: 0,
              living_amount: 0,
              ticket_amount: 0,
              shopping_amount: 0
            })
            .then(accounts => {
              return trx('journeys')
                .where('id', '=', accounts[0].journey_id)
                .returning('*')
                .then(journey => {
                  accounts[0].expenseList = [];
                  journey[0].accountList = accounts;
                  res.json(journey);
                })
                .then(trx.commit)
                .catch(trx.rollback);
            })
        })
      })
      .catch(err => res.status(400).json('unable to create journey'));
    })
    .catch(err => res.status(400).json('wrong credentials'));
};

const handlePatchJourney = (req, res, db) => {
  db('journeys').where('id', '=', req.params.id)
    .update({ name: req.body.name })
    .returning('*')
    .then(data => {
      data[0].accountList = [];
      db.select('*').from('accounts')
        .where('journey_id', '=', req.params.id)
        .orderBy('id', 'asc')
        .then(accounts => {
          const accountIdList = [];
          accounts.map(account => {
            account.expenseList = [];
            accountIdList.push(account.id);
            data[0].accountList.push(account);
          });
          
          db.select('*').from('expenses')
            .whereIn('account_id', accountIdList)
            .orderBy('id', 'asc')
            .then(expenses => {
              expenses.map(expense => {
                data[0].accountList.map(item => {
                  if (expense.account_id === item.id) {
                    item.expenseList.push(expense)
                  }
                })
              });

              const obj = Object.assign({}, { id: data[0].id, name: data[0].name });
              data.push(obj);
              res.json(data);
            })
            .catch(err => res.status(400).json('unable to get expenses'))
        })
        .catch(err => res.status(400).json('unable to get account'))
    })
    .catch(err => res.status(400).json('unable to update journey'));
};

const handlePatchBudget = (req, res, db) => {
  db('journeys').where('id', '=', req.params.id)
    .update(req.body)
    .returning('*')
    .then(journey => {
      res.json(journey)
    })
    .catch(err => res.status(400).json('unable to update budget'));
}

const handleDeleteJourney = (req, res, db) => {
  db('journeys')
    .where('id', '=', req.params.id)
    .del()
    .returning('*')
    .then(delJourney => {
      const data = [];
      db.select('*').from('journeys')
        .where('user_id', '=', delJourney[0].user_id)
        .orderBy('id', 'asc')
        .then(journeys => {
          journeys.map((journey) => {
            journey.accountList = [];
            return data.push(journey);
          });
          
          components.handleUpdateJourney(req, res, db, data);
        })
        .catch(err => res.status(400).json('error getting data'))
    })
    .catch(err => res.status(400).json('unable to delete journey'))
};

module.exports = {
  handlePostJourney,
  handlePatchJourney,
  handlePatchBudget,
  handleDeleteJourney
};
