exports.belongsToMany = [
  ["Teams", "Users", { through: 'TeamsUsers', foreignKey: 'TeamId' }],
  ["Users", "Teams", { through: 'TeamsUsers', foreignKey: 'UserId' }]
];

exports.hasMany = [
  ["Teams", "ImagesCollections"],
  ["ImagesCollections", "Images"],
  ["Teams", "NewsCollections"],
  ["NewsCollections", "News"],
  ["Teams", "VideosCollections"],
  ["VideosCollections", "Videos"]
];

exports.belongsTo = [
  ["ImagesCollections", "Teams"],
  ["Images", "ImagesCollections"],
  ["ImagesCollections", "Images"],
  ["NewsCollections", "Teams"],
  ["News", "NewsCollections"],
  ["News", "Images"],
  ["VideosCollections", "Teams"],
  ["Videos", "VideosCollections"],
  ["VideosCollections", "Videos"],
  ["Videos", "Images"]
];