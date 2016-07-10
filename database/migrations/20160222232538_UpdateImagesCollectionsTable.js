module.exports = {
  up: function(migration, DataTypes, done) {
    migration.addColumn(
      'ImagesCollections',
      'ImageId',
      {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    ).then(function(results) {
        done();
      });
  },

  down: function(migration, DataTypes, done) {
    migration.removeColumn('ImagesCollections', 'ImageId').then(function(results) {
      done();
    });
  }
}