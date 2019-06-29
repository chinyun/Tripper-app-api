const handlePatchBudget = (req, res, db) => {
  db('journeys')
    .where('journey_id', '=', req.body.id)
    .update({ budget: req.body.budget})
    .then(update => {
      res.json(update);
    })
    .catch(err => res.status(400).json('error editing budget'));
};

module.exports = {
  handlePatchBudget
};
