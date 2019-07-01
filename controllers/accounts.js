const components = require('./components');

const handlePostAccount = (req, res, db) => {
  db('accounts').insert({
      name: req.body.name,
      journey_id: req.body.journey_id,
      total_amount: 0,
      traffic_amount: 0,
      food_amount: 0,
      living_amount: 0,
      ticket_amount: 0,
      shopping_amount: 0
    })
    .returning('journey_id')
    .then(journeyId => {
      db.select('*').from('journeys')
        .where('id', '=', journeyId[0])
        .then(journey => {
          const data = [];
          journey.map(item => {
            item.accountList = [];
            return data.push(item);
          })
          components.handleUpdateJourney(req, res, db, data);
        })
        .catch(err => res.status(400).json('error getting journey'))
    })
    .catch(err => res.status(400).json('unable to create account'))
}

const handleDeleteAccount = (req, res, db) => {
  db('accounts')
    .where('id', '=', req.params.id)
    .del()
    .returning('*')
    .then(delAccount => {
      const data = [];
      db.select('*').from('journeys')
        .where('id', '=', delAccount[0].journey_id)
        .then(journey => {
          journey.map((item) => {
            item.accountList = [];
            return data.push(item);
          });
          components.handleUpdateJourney(req, res, db, data);
        })
        .catch(err => res.status(400).json('unable to get data'))
    })
    .catch(err => res.status(400).json('unable to delete account'))
}

module.exports = {
  handlePostAccount,
  handleDeleteAccount
};
