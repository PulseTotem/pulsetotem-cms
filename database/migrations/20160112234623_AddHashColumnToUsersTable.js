module.exports = {
  up: function(migration, DataTypes) {
    migration.addColumn(
      'Users',
      'hash',
      {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      }
    );
  },

  down: function(migration, DataTypes) {
    migration.removeColumn(
      'Users',
      'hash'
    );
  }
}