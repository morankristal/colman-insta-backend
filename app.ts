import initApp from "./server";

const PORT: string | number = process.env.PORT || 3000;

initApp()
    .then((app) => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Swagger docs available at http://localhost: ${PORT}/api-docs`);
        });
    })
    .catch((error) => {
        console.error("Failed to start the server:", error);
    });
