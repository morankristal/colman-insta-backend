module.exports = {
  apps: [{
    name: "colman-threads",
    script: "./dist/app.js",
    env_production: {
      NODE_ENV: "production"
    }
  }]
}
