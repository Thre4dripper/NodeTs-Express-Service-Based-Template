const MasterController = require('../utils/MasterController');
const CronBuilder = require('../utils/CronBuilder');
const { CronWeekday } = require('../enums/CronJob');

class DemoCron extends MasterController {
    cronController() {
        console.log('Cron job is running');
    }
}

// Unix Crontab format
DemoCron.cronJob('*/5 * * * * *');

// Using CronBuilder
DemoCron.cronJob(
    new CronBuilder()
        .every()
        .second()
        .every()
        .specificMinute([10, 20, 30])
        .every()
        .dayOfMonth()
        .every()
        .dayOfWeek(CronWeekday.Friday)
        .build()
);
