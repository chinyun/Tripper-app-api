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
      db('expenses').sum('amount as total_amount')
        .where('account_id', '=', accountId[0])
        .then(data => {
          db('accounts').where({id: accountId[0]})
            .update('total_amount', data[0].total_amount)
            .returning('id')
            .then(accountId => {
              db.select('category','account_id').sum('amount as traffic_amount')
                .from('expenses')
                .where('category', '=', '交通').andWhere('account_id', '=', accountId[0])
                .groupBy('category','account_id')
                .then(data => {
                  db('accounts').where({id: data[0].account_id})
                    .update('traffic_amount', data[0].traffic_amount)
                    .returning('id')
                    .then(accountId => {
                      db.select('category','account_id').sum('amount as food_amount')
                        .from('expenses')
                        .where('category', '=', '飲食').andWhere('account_id', '=', accountId[0])
                        .groupBy('category','account_id')
                        .then(data => {
                          db('accounts').where({id: data[0].account_id})
                            .update('food_amount', data[0].food_amount)
                            .returning('id')
                            .then(accountId => {
                              db.select('category','account_id').sum('amount as living_amount')
                                .from('expenses')
                                .where('category', '=', '住宿').andWhere('account_id', '=', accountId[0])
                                .groupBy('category','account_id')
                                .then(data => {
                                  db('accounts').where({id: data[0].account_id})
                                    .update('living_amount', data[0].living_amount)
                                    .returning('id')
                                    .then(accountId => {
                                      db.select('category','account_id').sum('amount as ticket_amount')
                                        .from('expenses')
                                        .where('category', '=', '票券').andWhere('account_id', '=', accountId[0])
                                        .groupBy('category','account_id')
                                        .then(data => {
                                          db('accounts').where({id: data[0].account_id})
                                            .update('ticket_amount', data[0].ticket_amount)
                                            .returning('id')
                                            .then(accountId => {
                                              db.select('category','account_id').sum('amount as shopping_amount')
                                                .from('expenses')
                                                .where('category', '=', '購物').andWhere('account_id', '=', accountId[0])
                                                .groupBy('category','account_id')
                                                .then(data => {
                                                  db('accounts').where({id: data[0].account_id})
                                                    .update('shopping_amount', data[0].shopping_amount)
                                                    .returning('id')
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
                                                    .catch(err => res.status(400).json('error getting account5'))
                                                })
                                                .catch(err => res.status(400).json('error getting shopping amount'))
                                            })
                                            .catch(err => res.status(400).json('error getting account4'))
                                        })
                                        .catch(err => res.status(400).json('error getting ticket amount'))
                                    })
                                    .catch(err => res.status(400).json('error getting account3'))
                                })
                                .catch(err => res.status(400).json('error getting living amount'))
                            })
                            .catch(err => res.status(400).json('error getting account2'))
                        })
                        .catch(err => res.status(400).json('error getting food amount'))
                    })
                    .catch(err => res.status(400).json('error getting account1'))
                })
                .catch(err => res.status(400).json('error getting traffic amount'));
            })
            .catch(err => res.status(400).json('error getting account'))
        })
        .catch(err => res.status(400).json('error getting total amount'))
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