const handleUpdateJourney = (req, res, db, data, user) => {
  db.select('*').from('accounts')
    .whereIn('journey_id', function() {
      this.select('id').from('journeys')
    }).orderBy('id', 'asc')
    .then(accounts => {
      accounts.map((account) => {
        account.expenseList = [];
        data.map((item) => {
          if(account.journey_id === item.id) {
            item.accountList.push(account)
          }
        })
      });
      db.select('*').from('expenses')
        .whereIn('account_id', function() {
          this.select('id').from('accounts')
        }).orderBy('id', 'asc')
        .then(expenses => {
          expenses.map((expense) => {
            data.map((item) => {
              item.accountList.map((account) => {
                if(expense.account_id === account.id) {
                  account.expenseList.push(expense)
                }
              })
            })
          });
          if(user !== undefined) {
            userData = Object.assign({}, {
              id: user[0].id,
              name: user[0].name,
              email: user[0].email
            });
            data.push(userData);
          }
          res.json(data);
        })
        .catch(err => res.status(400).json('error getting expenseList'))
    })
    .catch(err => res.status(400).json('error getting accountList'))
}

const handleUpdateExpense = (req, res, db, updatedAmount, updatedExpense) => {
  db.select('category','account_id').sum('amount as updated_amount')
    .from('expenses').where('category', '=', req.body.category)
    .andWhere('account_id', '=', req.body.account_id)
    .groupBy('category','account_id')
    .then(data => {
      db('accounts').where({id:  data[0].account_id})
        .update(`${updatedAmount}`, data[0].updated_amount)
        .returning('id')
        .then(accountId => {

          db('expenses').sum('amount as total_amount')
            .where('account_id', '=', accountId[0])
            .then(data => {
              db('accounts').where({id: accountId[0]})
                .update('total_amount', data[0].total_amount)
                .returning('journey_id')
                .then(journeyId => {

                  db('accounts').sum('total_amount as expense')
                    .where('journey_id', '=', journeyId[0])
                    .then(data => {
                      db('journeys').where({id: journeyId[0]})
                        .update('expense', data[0].expense)
                        .returning('id')
                        .then(journeyId => {

                          db('accounts').sum(`${updatedAmount} as updated_expense`)
                            .where('journey_id', '=', journeyId[0])
                            .then(data => {
                              db('journeys').where({id: journeyId[0]})
                                .update(`${updatedExpense}`, data[0].updated_expense)
                                .returning('*')
                                .then(journey => {

                                  const data = [];
                                  journey.map(item => {
                                    item.accountList = [];
                                    return data.push(item);
                                  })
                                  handleUpdateJourney(req, res, db, data);
                                })
                                .catch(err => res.status(400).json('error getting journey'))
                            })
                            .catch(err => res.status(400).json(`error updating ${updatedExpense}`))
                        })
                        .catch(err => res.status(400).json(`error summing ${updatedAmount}`))
                    })
                    .catch(err => res.status(400).json('error updating expense'))
                })
                .catch(err => res.status(400).json('error summing amounts'))
            })
            .catch(err => res.status(400).json('error updating amount'))
        })
        .catch(err => res.status(400).json('error summing expenses'))
    })
    .catch(err => res.status(400).json('error getting amounts'))
}

module.exports = {
  handleUpdateJourney,
  handleUpdateExpense
};
