const knex = require('./connection.js');

// Permission Queries


async function hasTicketPermission(ticketId, userId) {
    try {
        const result = await knex('tickets')
            .join('memberships', 'memberships.user_id', '=', 'tickets.created_by_user_id')
            .where('tickets.id', ticketId)
            .andWhere('memberships.user_id', userId)
            .select('tickets.id')
            .first();

        return !!result; // Return true if permission exists
    } catch (error) {
        console.error('Error checking ticket permission:', error);
        throw new Error('Failed to check ticket permissions');
    }
}


async function hasOrganizationPermission(organizationId, userId) {
    try {
        const result = await knex('memberships')
            .where({ organization_id: organizationId, user_id: userId })
            .first();

        return !!result; // Return true if the user is in the organization
    } catch (error) {
        console.error('Error checking organization permission:', error);
        throw new Error('Failed to check organization permissions');
    }
}

// Ticket Queries

async function getAllTickets({ limit = 10, offset = 0 } = {}) {
    try {
        return await knex('tickets').select('*').limit(limit).offset(offset);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        throw new Error('Failed to fetch tickets');
    }
}


async function get(id) {
    try {
        const results = await knex('tickets').where({ id });
        if (!results.length) {
            throw new Error(`Ticket with id ${id} not found`);
        }
        return results[0];
    } catch (error) {
        console.error('Error fetching ticket:', error);
        throw new Error('Failed to fetch ticket');
    }
}


async function create(ticketData) {
    try {
        const results = await knex('tickets').insert(ticketData).returning('*');
        return results[0];
    } catch (error) {
        console.error('Error creating ticket:', error);
        throw new Error('Failed to create ticket');
    }
}


async function update(id, properties) {
    try {
        const allowedFields = ['title', 'status', 'assigned_user_id'];
        const validUpdates = Object.keys(properties).reduce((acc, key) => {
            if (allowedFields.includes(key)) acc[key] = properties[key];
            return acc;
        }, {});

        if (Object.keys(validUpdates).length === 0) {
            throw new Error('No valid fields to update');
        }

        const results = await knex('tickets')
            .where({ id })
            .update(validUpdates)
            .returning('*');

        if (!results.length) {
            throw new Error(`Ticket with id ${id} not found`);
        }

        return results[0];
    } catch (error) {
        console.error('Error updating ticket:', error);
        throw new Error('Failed to update ticket');
    }
}


async function del(id) {
    try {
        const results = await knex('tickets').where({ id }).del().returning('*');
        if (!results.length) {
            throw new Error(`Ticket with id ${id} not found`);
        }
        return results[0];
    } catch (error) {
        console.error('Error deleting ticket:', error);
        throw new Error('Failed to delete ticket');
    }
}


async function deleteAllTickets() {
    try {
        return await knex('tickets').del();
    } catch (error) {
        console.error('Error deleting all tickets:', error);
        throw new Error('Failed to delete all tickets');
    }
}


async function getForOrganization(organizationId, { status, limit = 10, offset = 0 } = {}) {
    try {
        const query = knex('tickets')
            .join('memberships', 'tickets.created_by_user_id', '=', 'memberships.user_id')
            .where('memberships.organization_id', organizationId)
            .select('tickets.*');

        if (status) {
            query.andWhere('tickets.status', status);
        }

        return await query.limit(limit).offset(offset);
    } catch (error) {
        console.error('Error fetching tickets for organization:', error);
        throw new Error('Failed to fetch tickets for organization');
    }
}

module.exports = {
    getAllTickets,
    get,
    create,
    update,
    delete: del,
    deleteAllTickets,
    getForOrganization,
    hasTicketPermission,
    hasOrganizationPermission
};
