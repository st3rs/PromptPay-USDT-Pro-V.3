import "dotenv/config";
import { app, loadBitkubConfig, startAutoRateSync } from "../src/app";

// Initialize on cold start
loadBitkubConfig();
startAutoRateSync();

export default app;
