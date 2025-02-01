const _ = require('lodash');
const tickets = require('./database/ticket-queries.js');

// TODO: use bearer token authentication for all routes
// TODO: use role and org permissioning for relevant routes
// TODO: user and org create routes

async function createTicket(req, data) {
  const data = {
    createdByUserId: data.createdByUserId,
    assignedUserId: data.assignedUserId,
    status: data.status,
    title: data.title,
  };
  await tickets.createTicket(data)
  return data
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
// Create user routes

const toExport = {
    getAllTickets: { method: getAllTickets, errorMessage: "Could not fetch all tickets" },
    getTicket: { method: getTicket, errorMessage: "Could not fetch Ticket" },
    postTicket: { method: postTicket, errorMessage: "Could not post Ticket" },
    patchTicket: { method: patchTicket, errorMessage: "Could not patch Ticket" },
    deleteTicket: { method: deleteTicket, errorMessage: "Could not delete Ticket" }
}

for (let route in toExport) {
    toExport[route] = addErrorReporting(toExport[route].method, toExport[route].errorMessage);
}

module.exports = toExport;
