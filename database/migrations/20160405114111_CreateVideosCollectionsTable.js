module.exports = {
  up: function(migration, DataTypes) {
    migration.createTable('VideosCollections', {
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
        },
        VideoId : {
          type: DataTypes.INTEGER,
          allowNull: true
        }
      }
    );
  },

  down: function(migration, DataTypes) {
    migration.dropTable('VideosCollections');
  }
}