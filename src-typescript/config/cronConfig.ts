import MasterController from '../app/utils/MasterController';
import asyncHandler from '../app/utils/AsyncHandler';
import { CronJob } from 'cron';

export enum CronWeekday {
    Sunday = 'sun',
    Monday = 'mon',
    Tuesday = 'tue',
    Wednesday = 'wed',
    Thursday = 'thu',
    Friday = 'fri',
    Saturday = 'sat',
}

export enum CronMonth {
    January = 'jan',
    February = 'feb',
    March = 'mar',
    April = 'apr',
    May = 'may',
    June = 'jun',
    July = 'jul',
    August = 'aug',
    September = 'sep',
    October = 'oct',
    November = 'nov',
    December = 'dec',
}

class CronPatternBuilder {
    private readonly fields: { [key: string]: string };

    constructor() {
        this.fields = {
            second: '*',
            minute: '*',
            hour: '*',
            dayOfMonth: '*',
            month: '*',
            dayOfWeek: '*',
        };
    }

    protected setField(field: string, value: string): void {
        if (!['second', 'minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'].includes(field)) {
            throw new Error('Invalid field name');
        }
        this.fields[field] = value;
    }

    // Entry point for every()
    public every(): Every {
        return new Every();
    }

    protected build(): string {
        return [
            this.fields.second,
            this.fields.minute,
            this.fields.hour,
            this.fields.dayOfMonth,
            this.fields.month,
            this.fields.dayOfWeek,
        ].join(' ');
    }
}

class CronConfig extends CronPatternBuilder {
    static startCronJobs = () => {
        MasterController.getCronRequests().forEach((client) => {
            asyncHandler(
                (async () => {
                    const pattern =
                        typeof client.cronPattern === 'string'
                            ? client.cronPattern
                            : client.cronPattern.build();
                    const cron = new CronJob(pattern, () => {
                        client.masterController.cronController();
                    });

                    cron.start();
                })()
            );
        });
    };
}

class Every extends CronPatternBuilder {
    // If `second()` is called without a parameter, it assumes "every second"
    public second(n?: number): CronPatternBuilder {
        if (n === undefined) {
            this.setField('second', '*'); // Every second
        } else {
            if (n < 1 || n > 59) {
                throw new Error('Invalid value for seconds in Cron Pattern');
            }
            this.setField('second', `*/${n}`); // Every N seconds
        }
        return this;
    }

    public everySpecificSecond(seconds: number[]): CronPatternBuilder {
        if (seconds.length === 0) {
            throw new Error('No seconds provided');
        }

        if (seconds.some((second) => second < 0 || second > 59)) {
            throw new Error('Invalid value for seconds in Cron Pattern');
        }
        const secondsString = seconds.join(',');
        this.setField('second', secondsString);
        return this;
    }

    public secondBetween(start: number, end: number): CronPatternBuilder {
        if (start < 0 || start > 59 || end < 0 || end > 59) {
            throw new Error('Invalid value for seconds in Cron Pattern');
        }
        this.setField('second', `${start}-${end}`);
        return this;
    }

    public minute(n?: number): CronPatternBuilder {
        if (n === undefined) {
            this.setField('minute', '*'); // Every minute
        } else {
            if (n < 0 || n > 59) {
                throw new Error('Invalid value for minutes in Cron Pattern');
            }
            this.setField('minute', `*/${n}`); // Every N minutes
        }
        return this;
    }

    public everySpecificMinute(minutes: number[]): CronPatternBuilder {
        if (minutes.length === 0) {
            throw new Error('No minutes provided');
        }

        if (minutes.some((minute) => minute < 0 || minute > 59)) {
            throw new Error('Invalid value for minutes in Cron Pattern');
        }
        const minutesString = minutes.join(',');
        this.setField('minute', minutesString);
        return this;
    }

    public minuteBetween(start: number, end: number): CronPatternBuilder {
        if (start < 0 || start > 59 || end < 0 || end > 59) {
            throw new Error('Invalid value for minutes in Cron Pattern');
        }
        this.setField('minute', `${start}-${end}`);
        return this;
    }

    public hour(n?: number): CronPatternBuilder {
        if (n === undefined) {
            this.setField('hour', '*'); // Every hour
        } else {
            if (n < 0 || n > 23) {
                throw new Error('Invalid value for hours in Cron Pattern');
            }
            this.setField('hour', `*/${n}`); // Every N hours
        }
        return this;
    }

    public everySpecificHour(hours: number[]): CronPatternBuilder {
        if (hours.length === 0) {
            throw new Error('No hours provided');
        }

        if (hours.some((hour) => hour < 0 || hour > 23)) {
            throw new Error('Invalid value for hours in Cron Pattern');
        }
        const hoursString = hours.join(',');
        this.setField('hour', hoursString);
        return this;
    }

    public hourBetween(start: number, end: number): CronPatternBuilder {
        if (start < 0 || start > 23 || end < 0 || end > 23) {
            throw new Error('Invalid value for hours in Cron Pattern');
        }
        this.setField('hour', `${start}-${end}`);
        return this;
    }

    public dayOfMonth(n?: number): CronPatternBuilder {
        if (n === undefined) {
            this.setField('dayOfMonth', '*'); // Every day of the month
        } else {
            if (n < 1 || n > 31) {
                throw new Error('Invalid value for day of the month in Cron Pattern');
            }
            this.setField('dayOfMonth', `*/${n}`); // Every N days of the month
        }
        return this;
    }

    public everySpecificDayOfMonth(days: number[]): CronPatternBuilder {
        if (days.length === 0) {
            throw new Error('No days provided');
        }

        if (days.some((day) => day < 1 || day > 31)) {
            throw new Error('Invalid value for days in Cron Pattern');
        }
        const daysString = days.join(',');
        this.setField('dayOfMonth', daysString);
        return this;
    }

    public dayOfMonthBetween(start: number, end: number): CronPatternBuilder {
        if (start < 1 || start > 31 || end < 1 || end > 31) {
            throw new Error('Invalid value for days in Cron Pattern');
        }
        this.setField('dayOfMonth', `${start}-${end}`);
        return this;
    }

    public dayOfWeek(day?: CronWeekday): CronPatternBuilder {
        if (day === undefined) {
            this.setField('dayOfWeek', '*'); // Every day of the week
        } else {
            this.setField('dayOfWeek', `${day}`);
        }
        return this;
    }

    public everySpecificDayOfWeek(days: CronWeekday[]): CronPatternBuilder {
        if (days.length === 0) {
            throw new Error('No days provided');
        }

        const daysString = days.map((day) => `${day}`).join(',');
        this.setField('dayOfWeek', daysString);
        return this;
    }

    public month(month?: CronMonth): CronPatternBuilder {
        if (month === undefined) {
            this.setField('month', '*'); // Every month
        } else {
            this.setField('month', `${month}`);
        }
        return this;
    }

    public everySpecificMonth(months: CronMonth[]): CronPatternBuilder {
        if (months.length === 0) {
            throw new Error('No months provided');
        }

        const monthsString = months.map((month) => `${month}`).join(',');
        this.setField('month', monthsString);
        return this;
    }

    public everySpecificMonthBetween(start: CronMonth, end: CronMonth): CronPatternBuilder {
        const startMonth = Object.values(CronMonth).indexOf(start);
        const endMonth = Object.values(CronMonth).indexOf(end);

        if (startMonth === -1 || endMonth === -1) {
            throw new Error('Invalid value for months in Cron Pattern');
        }

        this.setField('month', `${start}-${end}`);
        return this;
    }
}

export default CronConfig;
