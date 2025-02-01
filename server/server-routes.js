const knex = require('./database/connection');
const tickets = require('./database/ticket-queries.js');
const _ = require('lodash');

// Ticket Routes

async function createTicket(req, res) {
   // TODO: better validatiosn around user, get user from request maybe for the created by user
   // instead of making the client send that info
    try {
        const ticketData = {
            title: req.body.title,
            created_by_user_id: req.body.createdByUserId,
            assigned_user_id: req.body.assignedUserId,
            status: req.body.status || 'Ready'
        };

        const newTicket = await tickets.create(ticketData);

        res.status(201).json(newTicket);
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ error: 'Failed to create ticket' });
    }
}

// TODO: route specifically for claiming a ticket, perhaps?


async function getAllTickets(req, res) {
    try {
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = parseInt(req.query.offset, 10) || 0;

        const allTickets = await tickets.getAllTickets({ limit, offset });

        res.status(200).json(allTickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
}

async function getTicket(req, res) {
    try {
        const ticket = await tickets.get(req.params.id);

        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        res.status(200).json(ticket);
    } catch (error) {
        console.error('Error fetching ticket:', error);
        res.status(500).json({ error: 'Failed to fetch ticket' });
    }
}

async function updateTicket(req, res) {
    try {
        const updatedTicket = await tickets.update(req.params.id, req.body);

        if (!updatedTicket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        res.status(200).json(updatedTicket);
    } catch (error) {
        console.error('Error updating ticket:', error);
        res.status(500).json({ error: 'Failed to update ticket' });
    }
}

async function deleteTicket(req, res) {
    try {
        const deletedTicket = await tickets.delete(req.params.id);

        if (!deletedTicket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        res.status(200).json(deletedTicket);
    } catch (error) {
        console.error('Error deleting ticket:', error);
        res.status(500).json({ error: 'Failed to delete ticket' });
    }
}

// Membership Routes

async function addUserToOrganization(req, res) {
    try {
        const { userId } = req.body;
        const { orgId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const userExists = await knex('users').where({ id: userId }).first();
        if (!userExists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const orgExists = await knex('organizations').where({ id: orgId }).first();
        if (!orgExists) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        await knex('memberships').insert({ user_id: userId, organization_id: orgId });

        res.status(201).json({ message: 'User added to organization' });
    } catch (error) {
        console.error('Error adding user to organization:', error);
        res.status(500).json({ error: 'Failed to add user to organization' });
    }
}

// User Routes

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

// Organization Routes

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


function addErrorReporting(func, message) {
    return async function (req, res) {
        try {
            await func(req, res);
        } catch (err) {
            console.error(`${message} caused by:`, err);
            res.status(500).json({ error: `Opps! ${message}` });
        }
    };
}


const toExport = {
    createTicket: { method: createTicket, errorMessage: 'Could not create ticket' },
    getAllTickets: { method: getAllTickets, errorMessage: 'Could not fetch all tickets' },
    getTicket: { method: getTicket, errorMessage: 'Could not fetch ticket' },
    updateTicket: { method: updateTicket, errorMessage: 'Could not update ticket' },
    deleteTicket: { method: deleteTicket, errorMessage: 'Could not delete ticket' },
    addUserToOrganization: { method: addUserToOrganization, errorMessage: 'Could not add user to organization' },
    createUser: { method: createUser, errorMessage: 'Could not create user' },
    createOrganization: { method: createOrganization, errorMessage: 'Could not create organization' },
};

for (const route in toExport) {
    toExport[route] = addErrorReporting(toExport[route].method, toExport[route].errorMessage);
}

module.exports = toExport;
