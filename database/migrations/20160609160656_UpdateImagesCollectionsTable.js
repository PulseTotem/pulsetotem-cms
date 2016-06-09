module.exports = {
  up: function(migration, DataTypes) {
    migration.addColumn(
      'ImagesCollections',
      'autogenerate',
      {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    );
  },

  down: function(migration, DataTypes) {
    migration.removeColumn('ImagesCollections', 'autogenerate');
  }
}