module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable('NewsCollections', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        hashid: {
          type: DataTypes.STRING,
          unique: true,
          allowNull: false
        },
        name: {
          type: DataTypes.STRING,
          allowNull: true
        },
        description: {
          type: DataTypes.STRING,
          allowNull: true
        },
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
        UserId : {
          type: DataTypes.INTEGER,
          allowNull: true
        }
      }
    ).then(function(results) {
        done();
      });
  },

  down: function(migration, DataTypes, done) {
    migration.dropTable('NewsCollections').then(function(results) {
      done();
    });
  }
}