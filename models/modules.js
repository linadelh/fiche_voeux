module.exports = (sequelize, DataTypes) => {
    return sequelize.define('module', {
      nom: DataTypes.STRING
    });
  };
  