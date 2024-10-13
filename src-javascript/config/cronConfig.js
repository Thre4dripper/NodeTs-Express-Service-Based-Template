const MasterController = require('../app/utils/MasterController');
const asyncHandler = require('../app/utils/asyncHandler');
const { CronJob } = require('cron');
const fs = require('fs').promises;
const path = require('path');

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

module.exports = CronConfig;
