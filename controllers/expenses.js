const components = require('./components');

const handlePostExpense = (req, res, db) => {
  db('expenses').insert({
      category: req.body.category,
      detail: req.body.detail,
      amount: req.body.amount,
      account_id: req.body.account_id
    })
    .returning('account_id')
    .then(accountId => {
      db.select('journey_id').from('accounts')
        .where('id', '=', accountId[0])
        .then(journeyId => {
          db.select('*').from('journeys')
          .where('id', '=', journeyId[0].journey_id)
          .then(journey => {
            const data = [];
            journey.map(item => {
              item.accountList = [];
              return data.push(item);
            })
            components.handleUpdateJourney(req, res, db, data);
          })
          .catch(err => res.status(400).json('error getting data'))
        })
        .catch(err => res.status(400).json('error getting journey'))
    })
    .catch(err => res.status(400).json('unable to create account'))
}

const handlePatchExpense  = (req, res, db) => {
  db('expenses').where('id', '=', req.params.id)
    .update(req.body)
    .returning('account_id')
    .then(accountId => {
      db.select('journey_id').from('accounts')
        .where('id', '=', accountId[0])
        .then(journeyId => {
          db.select('*').from('journeys')
          .where('id', '=', journeyId[0].journey_id)
          .then(journey => {
            const data = [];
            journey.map(item => {
              item.accountList = [];
              return data.push(item);
            })
            components.handleUpdateJourney(req, res, db, data);
          })
          .catch(err => res.status(400).json('error getting data'))
        })
        .catch(err => res.status(400).json('error getting journey'))
    })
    .catch(err => res.status(400).json('unable to update expenses'))
}

const handleDeleteExpense = (req, res, db) => {
  db('expenses')
    .where('id', '=', req.params.id)
    .del()
    .returning('*')
    .then(delExpense => {
      const data = [];
      db.select('journey_id').from('accounts')
        .where('id', '=', delExpense[0].account_id)
        .then(journeyId => {
          db.select('*').from('journeys')
            .where('id', '=', journeyId[0].journey_id)
            .then(journey => {
              journey.map((item) => {
                item.accountList = [];
                return data.push(item);
              });
              components.handleUpdateJourney(req, res, db, data);
            })
            .catch(err => res.status(400).json('error getting data'))
        })
        .catch(err => res.status(400).json('error getting journey'))
    })
    .catch(err => res.status(400).json('unable to delete expense'))
} 

module.exports = {
  handlePostExpense,
  handlePatchExpense,
  handleDeleteExpense
};