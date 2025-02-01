
exports.up = function(knex) {
  return knex.schema.createTable('organizations', function(table) {
    table.increments('id').primary();
    table.string('name');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('organizations');
};
