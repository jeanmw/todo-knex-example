
exports.up = function(knex) {
  return knex.schema.createTable('tickets', function(table) {
    table.increments('id').primary();
    table.string('title');

    table.integer('assigned_user_id').unsigned().nullable();
    table.foreign('assigned_user_id').references('id').inTable('users').onDelete('SET NULL');

    // TODO: this should probably be non nullable
    table.integer('created_by_user_id').unsigned().nullable();
    table.foreign('created_by_user_id').references('id').inTable('users').onDelete('SET NULL');

    table.string('status').defaultTo('Ready');
    table.timestamps(true, true);
});
};

exports.down = function(knex) {
  return knex.schema.dropTable('tickets');
};
