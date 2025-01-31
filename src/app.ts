import initApp from "./server";
import https from "https"; 
import fs from "fs";

const PORT: string | number = process.env.PORT || 3000;

const privateKey = fs.readFileSync(process.env.SSL_KEY_PATH || "./client-key.pem");
const certificate = fs.readFileSync(process.env.SSL_CERT_PATH || "./client-cert.pem");

const credentials = { key: privateKey, cert: certificate };

initApp()
  .then((app) => {
    https.createServer(credentials, app).listen(PORT, () => {
      console.log("Server is running on https://localhost:443");
    });
  })
  .catch((error) => {
    console.error("Failed to start the server:", error);
  });

//   initApp()
//     .then((app) => {
//         app.listen(PORT, () => {
//             console.log(`Server running on port ${PORT}`);
//             console.log(`Swagger docs available at http://localhost: ${PORT}/api-docs`);
//         });
//     })
//     .catch((error) => {
//         console.error("Failed to start the server:", error);
//     });