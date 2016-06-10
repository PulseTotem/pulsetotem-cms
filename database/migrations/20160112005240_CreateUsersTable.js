module.exports = {
  up: function(migration, DataTypes) {
    migration.createTable('Users', {
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
        authkey: {
          type: DataTypes.STRING(500),
          unique: true,
          allowNull: false
        },
        username: {
          type: DataTypes.STRING,
          allowNull: true
        },
        email: {
          type: DataTypes.STRING,
          unique: true,
          allowNull: false
        },
        isAdmin: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false
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
        }
      }
    );
  },

  down: function(migration, DataTypes) {
    migration.dropTable('Users');
  }
}