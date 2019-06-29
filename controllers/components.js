const handleUpdateJourney = (req, res, db, data, user) => {
  db.select('*').from('accounts')
    .whereIn('journey_id', function() {
      this.select('id').from('journeys')
    })
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
        })
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

module.exports = {
  handleUpdateJourney
};