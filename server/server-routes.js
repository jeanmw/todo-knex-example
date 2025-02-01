const _ = require('lodash');
const tickets = require('./database/ticket-queries.js');

async function createTicket(data) {
  try {
      const ticketData = {
          created_by_user_id: data.createdByUserId,
          assigned_user_id: data.assignedUserId,
          status: data.status || 'Ready',
          title: data.title
      };

      const [newTicket] = await tickets.createTicket(ticketData);

      return newTicket;
  } catch (error) {
      console.error('Error creating ticket:', error);
      throw new Error('Failed to create ticket');
  }
}


async function getAllTickets(req, res) {
  const allEntries = await tickets.all();
  return res.send(allEntries.map( _.curry(createTicket)(req) ));
}

async function getTicket(req, res) {
  const Ticket = await tickets.get(req.params.id);
  return res.send(Ticket);
}

async function postTicket(req, res) {
  const created = await tickets.create(req.body.title, req.body.order);
  return res.send(createTicket(req, created));
}

async function patchTicket(req, res) {
  const patched = await tickets.update(req.params.id, req.body);
  return res.send(createTicket(req, patched));
}


async function deleteTicket(req, res) {
  const deleted = await tickets.delete(req.params.id);
  return res.send(createTicket(req, deleted));
}

function addErrorReporting(func, message) {
    return async function(req, res) {
        try {
            return await func(req, res);
        } catch(err) {
            console.log(`${message} caused by: ${err}`);

            // Not always 500, but for simplicity's sake.
            res.status(500).send(`Opps! ${message}.`);
        } 
    }
}

// Create membership routes

async function addUserToOrganization(req, res) {
  try {
      const { userId } = req.body;
      const { orgId } = req.params;

      if (!userId) {
          return res.status(400).json({ error: 'User ID is required' });
      }

      // Check if user exists
      const user = await knex('users').where({ id: userId }).first();
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      // Check if organization exists
      const org = await knex('organizations').where({ id: orgId }).first();
      if (!org) {
          return res.status(404).json({ error: 'Organization not found' });
      }

      // Insert into memberships table
      await knex('memberships').insert({ user_id: userId, organization_id: orgId });

      res.status(201).json({ message: 'User added to organization' });
  } catch (error) {
      console.error('Error adding user to organization:', error);
      res.status(500).json({ error: 'Failed to add user to organization' });
  }
}

// Create user routes

async function createUser(req, res) {
  try {
      const { name, email, role = 'Regular' } = req.body;

      if (!name || !email) {
          return res.status(400).json({ error: 'Name and email are required' });
      }

      const [userId] = await knex('users').insert({ name, email, role }).returning('id');

      res.status(201).json({ id: userId, name, email, role });
  } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
  }
}

async function createOrganization(req, res) {
  try {
      const { name } = req.body;

      if (!name) {
          return res.status(400).json({ error: 'Organization name is required' });
      }

      const [organizationId] = await knex('organizations').insert({ name }).returning('id');

      res.status(201).json({ id: organizationId, name });
  } catch (error) {
      console.error('Error creating organization:', error);
      res.status(500).json({ error: 'Failed to create organization' });
  }
}



const toExport = {
    getAllTickets: { method: getAllTickets, errorMessage: "Could not fetch all tickets" },
    getTicket: { method: getTicket, errorMessage: "Could not fetch Ticket" },
    postTicket: { method: postTicket, errorMessage: "Could not post Ticket" },
    patchTicket: { method: patchTicket, errorMessage: "Could not patch Ticket" },
    deleteTicket: { method: deleteTicket, errorMessage: "Could not delete Ticket" },
    addUserToOrganization: { method: addUserToOrganization, errorMessage: "Could not add user to organization" },
    createUser: { method: createUser, errorMessage: "Could not create user" },
    createOrganization: { method: createOrganization, errorMessage: "Could not create organization" },
}

for (let route in toExport) {
    toExport[route] = addErrorReporting(toExport[route].method, toExport[route].errorMessage);
}

module.exports = toExport;
