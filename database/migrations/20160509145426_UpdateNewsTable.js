module.exports = {
  up: function(migration, DataTypes) {
    migration.removeColumn('News', 'content');
    migration.addColumn(
      'News',
      'content',
      {
        type: DataTypes.TEXT,
        allowNull: true
      }
    );
  },

  down: function(migration, DataTypes) {
    migration.removeColumn('News', 'content');
    migration.addColumn(
      'News',
      'content',
      {
        type: DataTypes.STRING,
        allowNull: true
      }
    );
  }
}




