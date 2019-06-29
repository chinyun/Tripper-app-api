const test = (req, res, db) => {
  const datas = [];
  db.select('id').from('journeys')
    .where('user_id', '=', req.body.user_id )
    .then(journeys => {
      journeys.map((journey) => {
        journey.accountList = [];
        return datas.push(journey);
      })
      db.select('*').from('accounts')
        .whereIn('journey_id', function() {
          this.select('id').from('journeys');
        })
        .then(accounts => {
          accounts.map((account) => {
            account.expenseList = [];
            datas.map((item) => {
              if(account.journey_id === item.id) {
                item.accountList.push(account);
              }
            })
          });
          db.select('*').from('expenses')
            .whereIn('account_id', function(accounts) {
              this.select('id').from('accounts');
            })
            .then(expenses => {
              // needs to optimize ?
              expenses.map((expense) => {
                datas.map((data) => {
                  data.accountList.map((item) =>{
                    if(expense.account_id === item.id) {
                      item.expenseList.push(expense)
                    }
                  })
                })
              });
              res.json(datas);
            })
            .catch(err => res.status(400).json('error getting expenses'));
        })
        .catch(err => res.status(400).json('error getting accounts'));
    })
    .catch(err => res.status(400).json('error getting journeys'));
};

module.exports = {
  test
};
