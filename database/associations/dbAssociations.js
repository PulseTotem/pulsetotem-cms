exports.hasMany = [
  ["Users", "ImagesCollections"],
  ["ImagesCollections", "Images"]
];

exports.belongsTo = [
  ["ImagesCollections", "Users"],
  ["Images", "ImagesCollections"],
  ["ImagesCollections", "Images"]
];