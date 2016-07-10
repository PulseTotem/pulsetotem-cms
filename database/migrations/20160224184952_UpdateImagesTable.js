module.exports = {
  up: function(migration, DataTypes, done) {
    migration.addColumn(
      'Images',
      'extension',
      {
        type: DataTypes.STRING,
        allowNull: true
      }
    ).then(function(results) {
        done();
      });
  },

  down: function(migration, DataTypes, done) {
    migration.removeColumn('Images', 'extension').then(function(results) {
      done();
    });
  }
}