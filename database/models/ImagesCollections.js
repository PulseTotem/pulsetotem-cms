/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ImagesCollections', {
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
    ImageId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    autogenerate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    TeamId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'ImagesCollections',
    freezeTableName: true
  });
};
