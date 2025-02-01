exports.up = function(knex) {
  return knex.schema.createTable('memberships', function(table) {
    table.increments('id').primary();
    
    // Define user_id and organization_id as foreign keys
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');

    table.integer('organization_id').unsigned().notNullable();
    table.foreign('organization_id').references('id').inTable('organizations').onDelete('CASCADE');

    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('memberships');
};
