exports.hasMany = [
  ["Teams", "Users"],
  ["Users", "Teams"],
  ["Users", "ImagesCollections"],
  ["ImagesCollections", "Images"],
  ["Users", "NewsCollections"],
  ["NewsCollections", "News"],
  ["Users", "VideosCollections"],
  ["VideosCollections", "Videos"]
];

exports.belongsTo = [
  ["ImagesCollections", "Users"],
  ["Images", "ImagesCollections"],
  ["ImagesCollections", "Images"],
  ["NewsCollections", "Users"],
  ["News", "NewsCollections"],
  ["News", "Images"],
  ["VideosCollections", "Users"],
  ["Videos", "VideosCollections"],
  ["VideosCollections", "Videos"],
  ["Videos", "Images"]
];