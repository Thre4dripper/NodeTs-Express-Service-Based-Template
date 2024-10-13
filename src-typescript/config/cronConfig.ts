import MasterController from '../app/utils/MasterController';
import asyncHandler from '../app/utils/AsyncHandler';
import { CronJob } from 'cron';

class CronConfig {
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
