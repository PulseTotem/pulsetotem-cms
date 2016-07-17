module.exports = {
  up: function(migration, DataTypes, done) {
    migration.removeColumn('VideosCollections', 'UserId').then(function(results) {
      done();
    });
  },

  down: function(migration, DataTypes, done) {
    migration.addColumn(
      'VideosCollections',
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