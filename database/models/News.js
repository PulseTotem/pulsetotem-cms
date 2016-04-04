/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('News', {
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
      allowNull: false,
      defaultValue: 'now()'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: 'now()'
    },
    ImageId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    NewsCollectionId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'News',
    freezeTableName: true
  });
};
