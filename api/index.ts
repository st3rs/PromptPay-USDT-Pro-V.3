import { app, loadBitkubConfig } from "../server";

// Initialize Bitkub config on cold start
loadBitkubConfig().catch(console.error);

export default app;
