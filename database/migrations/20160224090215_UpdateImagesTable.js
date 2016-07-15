module.exports = {
  up: function(migration, DataTypes, done) {
    migration.addColumn(
      'Images',
      'mimetype',
      {
        type: DataTypes.STRING,
        allowNull: true
      }
    ).then(function(results) {
        done();
      });
  },

  down: function(migration, DataTypes, done) {
    migration.removeColumn('Images', 'mimetype').then(function(results) {
      done();
    });
  }
}