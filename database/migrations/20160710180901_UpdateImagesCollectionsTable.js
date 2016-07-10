module.exports = {
  up: function(migration, DataTypes, done) {
    migration.addColumn(
      'ImagesCollections',
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
    migration.removeColumn('ImagesCollections', 'TeamId').then(function(results) {
      done();
    });
  }
}