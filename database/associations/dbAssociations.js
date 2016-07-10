exports.hasMany = [
  ["Teams", "Users"],
  ["Users", "Teams"],
  ["Teams", "ImagesCollections"],
  ["Users", "ImagesCollections"],
  ["ImagesCollections", "Images"],
  ["Teams", "NewsCollections"],
  ["Users", "NewsCollections"],
  ["NewsCollections", "News"],
  ["Teams", "VideosCollections"],
  ["Users", "VideosCollections"],
  ["VideosCollections", "Videos"]
];

exports.belongsTo = [
  ["ImagesCollections", "Teams"],
  ["ImagesCollections", "Users"],
  ["Images", "ImagesCollections"],
  ["ImagesCollections", "Images"],
  ["NewsCollections", "Teams"],
  ["NewsCollections", "Users"],
  ["News", "NewsCollections"],
  ["News", "Images"],
  ["VideosCollections", "Teams"],
  ["VideosCollections", "Users"],
  ["Videos", "VideosCollections"],
  ["VideosCollections", "Videos"],
  ["Videos", "Images"]
];