module.exports = {
  up: function(migration, DataTypes, done) {
    migration.removeColumn('News', 'content').then(function(results) {
      migration.addColumn(
        'News',
        'content',
        {
          type: DataTypes.TEXT,
          allowNull: true
        }
      ).then(function(results) {
          done();
        });
    });

  },

  down: function(migration, DataTypes, done) {
    migration.removeColumn('News', 'content').then(function(results) {
      migration.addColumn(
        'News',
        'content',
        {
          type: DataTypes.STRING,
          allowNull: true
        }
      ).then(function(results) {
          done();
        });
    });

  }
}




