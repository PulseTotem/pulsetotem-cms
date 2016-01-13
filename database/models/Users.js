/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Users', {
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
    authkey: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
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
    }
  }, {
    tableName: 'Users',
    freezeTableName: true
  });
};
