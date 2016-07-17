module.exports = {
  up: function(migration, DataTypes, done) {
    migration.removeColumn('NewsCollections', 'UserId').then(function(results) {
      done();
    });
  },

  down: function(migration, DataTypes, done) {
    migration.addColumn(
      'NewsCollections',
      'UserId',
      {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    ).then(function(results) {
        done();
      });
  }
}