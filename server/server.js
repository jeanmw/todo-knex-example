const app = require('./server-config.js');
const routes = require('./server-routes.js');

const port = process.env.PORT || 5000;

app.get('/', routes.getAllTickets);
app.get('/:id', routes.getTicket);

app.post('/', routes.postTicket);
app.patch('/:id', routes.patchTicket);

app.delete('/:id', routes.deleteTicket);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`Listening on port ${port}`));
}

module.exports = app;