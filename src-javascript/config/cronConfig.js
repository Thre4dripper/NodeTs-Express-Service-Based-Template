const MasterController = require('../app/utils/MasterController');
const asyncHandler = require('../app/utils/asyncHandler');
const { CronJob } = require('cron');
const fs = require('fs').promises;
const path = require('path');

class CronConfig {
    /**
     * @description Method to initialize the cron jobs
     * @param dir - The directory to search for cron jobs
     */
    static InitCronJobs = async (dir) => {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                await CronConfig.InitCronJobs(fullPath);
            } else if (
                entry.isFile() &&
                (entry.name.endsWith('.cron.ts') || entry.name.endsWith('.cron.js'))
            ) {
                require(fullPath);
            }
        }
    };

    /**
     * @description Method to start the cron jobs for the registered crons
     */
    static startCronJobs = () => {
        MasterController.getCronRequests().forEach((client) => {
            asyncHandler(
                (async () => {
                    const cron = new CronJob(client.cronPattern, () => {
                        client.masterController.cronController();
                    });
                    cron.start();
                })()
            );
        });
    };
}

module.exports = CronConfig;
