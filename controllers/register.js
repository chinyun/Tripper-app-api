const components = require('./components');

const handleRegister = (req, res, db, bcrypt) => {
  const {name, email, password} = req.body;
  if(!name || !email || !password) {
    return res.status(400).json('incorrect form submission');
  }
  const hash = bcrypt.hashSync(password);
  db.transaction(trx => {
    trx.insert({
      hash: hash,
      email: email
    })
    .into('login')
    .returning('email')
    .then(loginEmail => {
      return trx('users')
        .returning('*')
        .insert({
          name: name,
          email: loginEmail[0],
          entries: 1,
          joined: new Date()
        })
        .then(user => {
          const data = [];         
          return trx('journeys')
            .returning('*')
            .insert({
              name: 'Template',
              budget: 0,
              expense: 0,
              traffic_budget: 0,
              food_budget: 0,
              living_budget: 0,
              ticket_budget: 0,
              shopping_budget: 0,
              user_id: user[0].id,
              traffic_expense: 0,
              food_expense: 0,
              living_expense: 0,
              ticket_expense: 0,
              shopping_expense: 0
            })
            .then(journeys =>{
              journeys[0].accountList = [];
              data.push(journeys[0]);
              return trx('accounts')
                .returning('*')
                .insert({
                  name: 'Day1',
                  journey_id: journeys[0].id,
                  total_amount: 0,
                  traffic_amount: 0,
                  food_amount: 0,
                  living_amount: 0,
                  ticket_amount: 0,
                  shopping_amount: 0
                })
                .then( accounts => {
                  accounts[0].expenseList = [];
                  data[0].accountList.push(accounts[0]);
                  userData = Object.assign({}, {
                    id: user[0].id,
                    name: user[0].name,
                    email: user[0].email
                  });
                  data.push(userData);
                  res.json(data);
                })
                .then(trx.commit)
                .catch(trx.rollback)
            })
        })
    })
    .catch(err => res.status(400).json('unable to register'))
  });
}

module.exports = {
  handleRegister
};