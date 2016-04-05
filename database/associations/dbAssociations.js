exports.hasMany = [
  ["Users", "ImagesCollections"],
  ["ImagesCollections", "Images"],
  ["Users", "NewsCollections"],
  ["NewsCollections", "News"]
];

exports.belongsTo = [
  ["ImagesCollections", "Users"],
  ["Images", "ImagesCollections"],
  ["ImagesCollections", "Images"],
  ["NewsCollections", "Users"],
  ["News", "NewsCollections"],
  ["News", "Images"]
];