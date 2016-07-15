module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable('TeamsUsers', {
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.fn('NOW'),
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.fn('NOW'),
        allowNull: false
      },
      TeamId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      UserId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
      }
    }).then(function(results) {
      done();
    });
  },

  down: function(migration, DataTypes, done) {
    migration.dropTable('TeamsUsers').then(function(results) {
      done();
    });
  }
}