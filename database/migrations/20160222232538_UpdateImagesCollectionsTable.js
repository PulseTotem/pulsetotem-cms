module.exports = {
  up: function(migration, DataTypes) {
    migration.addColumn(
      'ImagesCollections',
      'ImageId',
      {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    );
  },

  down: function(migration, DataTypes) {
    migration.removeColumn('ImagesCollections', 'ImageId');
  }
}