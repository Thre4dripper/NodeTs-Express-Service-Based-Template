import MasterController from '../utils/MasterController';
import CronBuilder from '../utils/CronBuilder';
import { CronWeekday } from '../enums/CronWeekday';

class DemoCron extends MasterController<null, null, null> {
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
