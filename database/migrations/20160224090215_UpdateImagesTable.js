module.exports = {
  up: function(migration, DataTypes) {
    migration.addColumn(
      'Images',
      'mimetype',
      {
        type: DataTypes.STRING,
        allowNull: true
      }
    );
  },

  down: function(migration, DataTypes) {
    migration.removeColumn('Images', 'mimetype');
  }
}