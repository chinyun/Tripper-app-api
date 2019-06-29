const components = require('./components');

const handleSignin = (req, res, db, bcrypt) => {
  const {email, password} = req.body;
  if(!email || !password) {
    return res.status(400).json('incorrect form submission');
  }
  db.select('email', 'hash').from('login')
    .where('email', '=', email)
    .then(data => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        const data = [];
        db('users').where('email', '=', email)
          .increment('entries', 1)
          .returning('*')
          .then(user => { 
            db.select('*').from('journeys')
              .where('user_id', '=', user[0].id)
              .then(journeys => {
                journeys.map((journey) =>{
                  journey.accountList = [];
                  return data.push(journey);
                });
                components.handleUpdateJourney(req, res, db, data, user);               
              })
              .catch(err => res.status(400).json('unable to get journeys'))
          })
          .catch(err => res.status(400).json('unable to get user'))
      } else {
        res.status(400).json('wrong credentials')
      }
    })
    .catch(err => res.status(400).json('wrong credentials'))
}

module.exports = {
  handleSignin
};