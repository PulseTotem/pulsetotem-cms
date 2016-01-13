/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('SequelizeMeta', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'null',
        key: 'null'
      }
    }
  }, {
    tableName: 'SequelizeMeta',
    freezeTableName: true
  });
};
