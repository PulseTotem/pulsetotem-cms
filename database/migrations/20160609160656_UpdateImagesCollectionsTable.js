module.exports = {
  up: function(migration, DataTypes, done) {
    migration.addColumn(
      'ImagesCollections',
      'autogenerate',
      {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    ).then(function(results) {
        done();
      });
  },

  down: function(migration, DataTypes, done) {
    migration.removeColumn('ImagesCollections', 'autogenerate').then(function(results) {
      done();
    });
  }
}