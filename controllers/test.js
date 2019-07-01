const test = (req, res, db) => {
  db.select('category','account_id').sum('amount as food_amount')
    .from('expenses')
    .where('category', '=', '飲食').andWhere('account_id', '=', req.body.account_id)
    .groupBy('category','account_id')
    .then(data =>{
      db('accounts').where({id: data[0].account_id})
        .update('food_amount', data[0].food_amount)
        .returning('*')
        .then(account => {
          res.json(account)
        })
        .catch(err => res.status(400).json('unable to get account'))
    })
    .catch(err => res.status(400).json('unable to get data'));
  // db('expenses').sum({totalAmount: 'amount'})
  //   .where('account_id', '=', req.body.account_id)
  //   .then(data => {
  //     res.json(data);
  //   })
  //   .catch(err => res.status(400).json('unable to get data'))
};

module.exports = {
  test
};
