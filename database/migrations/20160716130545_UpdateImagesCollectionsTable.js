module.exports = {
  up: function(migration, DataTypes, done) {
    migration.removeColumn('ImagesCollections', 'UserId').then(function(results) {
      done();
    });
  },

  down: function(migration, DataTypes, done) {
    migration.addColumn(
      'ImagesCollections',
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