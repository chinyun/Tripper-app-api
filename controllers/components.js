const handleUpdateJourney = (req, res, db, data, user) => {
  db.select('*').from('accounts')
    .whereIn('journey_id', function() {
      this.select('id').from('journeys')
    }).orderBy('id', 'asc')
    .then(accounts => {
      accounts.map((account) => {
        account.expenseList = [];
        data.map((item) => {
          if (account.journey_id === item.id) {
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
                if (expense.account_id === account.id) {
                  account.expenseList.push(expense)
                }
              })
            })
          });
          if (user !== undefined) {
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
  // sum the amount of expenses which are the same with 
  // the request's category and account_id in the expenses table.
  db.select('category','account_id')
    .sum('amount as updated_amount').from('expenses')
    .where('category', '=', req.body.category)
    .andWhere('account_id', '=', req.body.account_id)
    .groupBy('category','account_id')
    .returning('*')
    .then(data => {
      // if there is data, update the proper column with summed up result,
      // if not, update with 0.
      if (data.length === 0) {
        return db('accounts').where({id: req.body.account_id})
          .update(`${updatedAmount}`, 0);
      } else {
        return db('accounts').where({id: req.body.account_id})
          .update(`${updatedAmount}`, data[0].updated_amount)
      }
    })
    // sum every expense with the same account_id
    .then(() => {
      return db('expenses').sum('amount as total_amount')
        .where('account_id', '=', req.body.account_id)
        .returning('*')
    })
    .then(data => {
      // if there is data, update the total_amount column with data.
      // if not, update with 0.
      if (data[0].total_amount === null) {
        return db('accounts').where({id: req.body.account_id})
          .update('total_amount', 0)
          .returning('journey_id')
      } else {
        return db('accounts').where({id: req.body.account_id})
          .update('total_amount', data[0].total_amount)
          .returning('journey_id')
      }
    })
    // sum up every amounts of the request's category in accounts table with
    // the same journey_id,
    // and update to proper column in journeys table.
    .then(id => {
      return db('accounts').sum(`${updatedAmount} as updated_expense`)
        .where('journey_id', '=', id[0])
        .returning('*')
        .then(data => {
          if (data.length === 0) {
            return db('journeys').where({id: id[0]})
              .update(`${updatedExpense}`, 0)
              .returning('id')
          } else {
            return db('journeys').where({id: id[0]})
            .update(`${updatedExpense}`, data[0].updated_expense)
            .returning('id')
          }  
        })
    })
    // sum up every accounts' total_amount
    // and update to the correct joureny's expense column,
    // if no expenses, update with 0.
    .then(id=> {
      return db('accounts').sum('total_amount as expense')
        .where('journey_id', '=', id[0])
        .returning('*')
        .then(data => {
          if (data.length === 0) {
            return db('journeys').where({id: id[0]})
              .update('expense', 0)
              .returning('id')
          } else {
            return db('journeys').where({id: id[0]})
              .update('expense', data[0].expense)
              .returning('id')
          }
        })
    })
    .then(id => {
      return db.select('*').where({id: id[0]})
      .from('journeys')
      .returning('*')
    })
    .then(journey => {
      const data = [];
      journey.map(item => {
        item.accountList = [];
        return data.push(item);
      })
      handleUpdateJourney(req, res, db, data);
    })
    .catch(err => {
      console.log(err);
      res.status(400).json('unable to update expenses');
    })    
}

module.exports = {
  handleUpdateJourney,
  handleUpdateExpense
};
