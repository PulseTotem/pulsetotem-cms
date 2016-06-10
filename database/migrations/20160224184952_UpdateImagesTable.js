module.exports = {
  up: function(migration, DataTypes) {
    migration.addColumn(
      'Images',
      'extension',
      {
        type: DataTypes.STRING,
        allowNull: true
      }
    );
  },

  down: function(migration, DataTypes) {
    migration.removeColumn('Images', 'extension');
  }
}