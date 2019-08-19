const components = require('./components');

const handleCategorySwitch = (req, res, db) => {
  switch(req.body.category) {
    case '交通':
      return components.handleUpdateExpense(req, res, db,
        updatedAmount='traffic_amount', updatedExpense='traffic_expense')
    case '飲食':
      return components.handleUpdateExpense(req, res, db,
        updatedAmount='food_amount', updatedExpense='food_expense')
    case '住宿':
      return components.handleUpdateExpense(req, res, db,
        updatedAmount='living_amount', updatedExpense='living_expense')
    case '票券':
      return components.handleUpdateExpense(req, res, db,
        updatedAmount='ticket_amount', updatedExpense='ticket_expense')
    case '購物':
      return components.handleUpdateExpense(req, res, db,
        updatedAmount='shopping_amount', updatedExpense='shopping_expense')
    default:
      return components.handleUpdateJourney(req, res, db)
  }
}

const handlePostExpense = (req, res, db) => {
  db('expenses').insert({
      category: req.body.category,
      detail: req.body.detail,
      amount: req.body.amount,
      account_id: req.body.account_id
    })
    .returning('account_id')
    .then(accountId => {
      handleCategorySwitch(req, res, db)
    })
    .catch(err => res.status(400).json('unable to create account'))
}

const handlePatchExpense  = (req, res, db) => {
  db('expenses').where('id', '=', req.params.id)
    .update(req.body)
    .returning('account_id')
    .then(accountId => {
      handleCategorySwitch(req, res, db)
    })
    .catch(err => res.status(400).json('unable to update expenses'))
}

const handleDeleteExpense = (req, res, db) => {
  db('expenses').where('id', '=', req.params.id)
    .del()
    .returning('*')
    .then(data => {
      handleCategorySwitch(req, res, db)
    })
    .catch(err => res.status(400).json('unable to delete expense'))
} 

module.exports = {
  handlePostExpense,
  handlePatchExpense,
  handleDeleteExpense
};
