module.exports = {
  apps: [{
    name: "colman-threads",
    script: "./dist/app.js",
    env_production: {
      NODE_ENV: "production",
      VITE_BACKEND_URL: "https://10.10.246.25",
      MONGO_URI: "mongodb://server:123123123@127.0.0.1:21771/web_class",
      PORT: 443,
      TOKEN_SECRET: "51c41a352c64f067a3e40cc5bbabf2a42ef696d740239401c30d3ae2df9fbf4fe4645e790df1b57cbd83cea13fe624baf95f038ef5ad30030e0eaa86b7dc7fe",
      TOKEN_EXPIRES: '3d',
      REFRESH_TOKEN_EXPIRES: '7d',
      GOOGLE_CLIENT_ID: "653142317212-n5n2jtq45ddn5p7825a8dicgbsn0e95n.apps.googleusercontent.com",
      GOOGLE_API_KEY: "AIzaSyCbQbBsfC435dtq608Uc0NN3NUYSm7ynHU",
      BASE_URL: "https://10.10.246.25",
    }
  }]
}
