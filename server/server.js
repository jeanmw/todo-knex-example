const app = require('./server-config.js');
const routes = require('./server-routes.js');

const port = process.env.PORT || 5000;

// Ticket Routes
app.get('/tickets', routes.getAllTickets); // Fetch all tickets
app.get('/tickets/:id', routes.getTicket); // Fetch a single ticket by ID
app.post('/tickets', routes.createTicket); // Create a new ticket
app.patch('/tickets/:id', routes.updateTicket); // Update a ticket by ID
app.delete('/tickets/:id', routes.deleteTicket); // Delete a ticket by ID

// User Routes
app.post('/users', routes.createUser); // Create a new user

// Organization Routes
app.post('/organizations', routes.createOrganization); // Create a new organization
app.post('/organizations/:orgId/users', routes.addUserToOrganization); // Add user to an organization

// Catch-All Route for Undefined Endpoints
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`Listening on port ${port}`));
}

module.exports = app;
