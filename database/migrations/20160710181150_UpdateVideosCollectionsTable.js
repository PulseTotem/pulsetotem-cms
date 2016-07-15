module.exports = {
  up: function(migration, DataTypes, done) {
    migration.addColumn(
      'VideosCollections',
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
    migration.removeColumn('VideosCollections', 'TeamId').then(function(results) {
      done();
    });
  }
}