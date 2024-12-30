import initApp from "./server";

const PORT: string | number = process.env.PORT || 3000;

initApp()
    .then((app) => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to start the server:", error);
    });
