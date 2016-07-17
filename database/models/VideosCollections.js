/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('VideosCollections', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    hashid: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
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
      allowNull: false,
      defaultValue: 'now()'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: 'now()'
    },
    VideoId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    TeamId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'VideosCollections',
    freezeTableName: true
  });
};
