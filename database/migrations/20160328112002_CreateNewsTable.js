module.exports = {
  up: function(migration, DataTypes) {
    migration.createTable('News', {
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
        title: {
          type: DataTypes.STRING,
          allowNull: true
        },
        content: {
          type: DataTypes.STRING,
          allowNull: true
        },
        begin: {
          type: DataTypes.STRING,
          allowNull: true
        },
        end: {
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
        ImageId : {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        NewsCollectionId : {
          type: DataTypes.INTEGER,
          allowNull: true
        }
      }
    );
  },

  down: function(migration, DataTypes) {
    migration.dropTable('News');
  }
}