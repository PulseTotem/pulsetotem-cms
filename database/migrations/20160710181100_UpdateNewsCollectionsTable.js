module.exports = {
  up: function(migration, DataTypes, done) {
    migration.addColumn(
      'NewsCollections',
      'TeamId',
      {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    ).then(function(results) {
        done();
      });
  },

  down: function(migration, DataTypes, done) {
    migration.removeColumn('NewsCollections', 'TeamId').then(function(results) {
      done();
    });
  }
}