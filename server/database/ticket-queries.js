const knex = require("./connection.js");

// TOOD: permissioning queries for org and role level access

// async function hasTicketPermission(ticketId, userId) {
//     try {

//         await memberships

//     } catch (error) {
//         console.error('Error accessing ticket:', error);
//         throw new Error('Failed to fetch ticket');
//     }
// }

// async function getForOrganization(organizationId) {
//     try {
//         return await knex('tickets')
//             .join('memberships', 'tickets.user_id', '=', 'memberships.user_id') // Join on user_id
//             .where('memberships.organization_id', organizationId) // Filter by organization
//             .select('tickets.*'); // Select only ticket fields
//     } catch (error) {
//         console.error('Error fetching tickets:', error);
//         throw new Error('Failed to fetch tickets');
//     }
// }

async function getAllTickets() {
    const results = await knex('tickets');
    return results;
}

async function get(id) {
    const results = await knex('tickets').where({ id });
    return results[0];
}

async function create(title, order) {
    const results = await knex('tickets').insert({ title, order }).returning('*');
    return results[0];
}

async function update(id, properties) {
    const results = await knex('tickets').where({ id }).update({ ...properties }).returning('*');
    return results[0];
}

// delete is a reserved keyword
async function del(id) {
    const results = await knex('tickets').where({ id }).del().returning('*');
    return results[0];
}

async function clear() {
    return knex('tickets').del().returning('*');
}

module.exports = {
    getAllTickets,
    get,
    create,
    update,
    delete: del,
    clear
}