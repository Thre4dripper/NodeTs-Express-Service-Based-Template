import MasterController from '../app/utils/MasterController';
import asyncHandler from '../app/utils/AsyncHandler';
import { CronJob } from 'cron';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

class CronConfig {
    /**
     * @description Method to initialize the cron jobs
     * @param dir - The directory to search for cron jobs
     */
    static InitCronJobs = async (dir: string) => {
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

export default CronConfig;
