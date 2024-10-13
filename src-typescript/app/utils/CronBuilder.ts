import { CronMonth } from '../enums/CronMonth';
import { CronWeekday } from '../enums/CronWeekday';

class CronBuilder {
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

    // Entry point for every()
    public every(): Every {
        return new Every();
    }

    /**
     * @description Helper method to set the field value in the cron pattern
     * @param field - Field name to be set
     * @param value - Value to be set
     * @protected
     */
    protected setField(field: string, value: string): void {
        if (!['second', 'minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'].includes(field)) {
            throw new Error('Invalid field name');
        }
        this.fields[field] = value;
    }

    /**
     * @description Method to build the cron pattern
     * @private
     */
    public build(): string {
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

class Every extends CronBuilder {
    /**
     * @description Method to set the seconds in the cron pattern
     * If `second()` is called without a parameter, it assumes "every second"
     * @param second - Seconds
     */
    public second(second?: number): CronBuilder {
        if (second === undefined) {
            this.setField('second', '*'); // Every second
        } else {
            if (second < 1 || second > 59) {
                throw new Error('Invalid value for seconds in Cron Pattern');
            }
            this.setField('second', `*/${second}`); // Every N seconds
        }
        return this;
    }

    /**
     * @description Method to set the specific seconds in the cron pattern
     * @param seconds - Array of seconds
     */
    public specificSeconds(seconds: number[]): CronBuilder {
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

    /**
     * @description Method to set the seconds range in the cron pattern
     * @param start - Start value
     * @param end - End value
     */
    public secondBetween(start: number, end: number): CronBuilder {
        if (start < 0 || start > 59 || end < 0 || end > 59) {
            throw new Error('Invalid value for seconds in Cron Pattern');
        }
        this.setField('second', `${start}-${end}`);
        return this;
    }

    /**
     * @description Method to set the minutes in the cron pattern
     * If `minute()` is called without a parameter, it assumes "every minute"
     * @param minute - Minutes
     */
    public minute(minute?: number): CronBuilder {
        if (minute === undefined) {
            this.setField('minute', '*'); // Every minute
        } else {
            if (minute < 0 || minute > 59) {
                throw new Error('Invalid value for minutes in Cron Pattern');
            }
            this.setField('minute', `*/${minute}`); // Every N minutes
        }
        return this;
    }

    /**
     * @description Method to set the specific minutes in the cron pattern
     * @param minutes - Array of minutes
     */
    public specificMinute(minutes: number[]): CronBuilder {
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

    /**
     * @description Method to set the minutes range in the cron pattern
     * @param start - Start value
     * @param end - End value
     */
    public minuteBetween(start: number, end: number): CronBuilder {
        if (start < 0 || start > 59 || end < 0 || end > 59) {
            throw new Error('Invalid value for minutes in Cron Pattern');
        }
        this.setField('minute', `${start}-${end}`);
        return this;
    }

    /**
     * @description Method to set the hours in the cron pattern
     * If `hour()` is called without a parameter, it assumes "every hour"
     * @param hour - Hour
     */
    public hour(hour?: number): CronBuilder {
        if (hour === undefined) {
            this.setField('hour', '*'); // Every hour
        } else {
            if (hour < 0 || hour > 23) {
                throw new Error('Invalid value for hours in Cron Pattern');
            }
            this.setField('hour', `*/${hour}`); // Every N hours
        }
        return this;
    }

    /**
     * @description Method to set the specific hours in the cron pattern
     * @param hours - Array of hours
     */
    public specificHour(hours: number[]): CronBuilder {
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

    /**
     * @description Method to set the hours range in the cron pattern
     * @param start - Start value
     * @param end - End value
     */
    public hourBetween(start: number, end: number): CronBuilder {
        if (start < 0 || start > 23 || end < 0 || end > 23) {
            throw new Error('Invalid value for hours in Cron Pattern');
        }
        this.setField('hour', `${start}-${end}`);
        return this;
    }

    /**
     * @description Method to set the day of the month in the cron pattern
     * If `dayOfMonth()` is called without a parameter, it assumes "every day of the month"
     * @param n - Number of days
     */
    public dayOfMonth(n?: number): CronBuilder {
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

    /**
     * @description Method to set the specific days of the month in the cron pattern
     * @param n - Array of days
     */
    public specificDayOfMonth(n: number[]): CronBuilder {
        if (n.length === 0) {
            throw new Error('No days provided');
        }

        if (n.some((day) => day < 1 || day > 31)) {
            throw new Error('Invalid value for days in Cron Pattern');
        }
        const daysString = n.join(',');
        this.setField('dayOfMonth', daysString);
        return this;
    }

    /**
     * @description Method to set the days of the month range in the cron pattern
     * @param start - Start value
     * @param end - End value
     */
    public dayOfMonthBetween(start: number, end: number): CronBuilder {
        if (start < 1 || start > 31 || end < 1 || end > 31) {
            throw new Error('Invalid value for days in Cron Pattern');
        }
        this.setField('dayOfMonth', `${start}-${end}`);
        return this;
    }

    /**
     * @description Method to set the day of the week in the cron pattern
     * If `dayOfWeek()` is called without a parameter, it assumes "every day of the week"
     * @param day - Day of the week
     */
    public dayOfWeek(day?: CronWeekday): CronBuilder {
        if (day === undefined) {
            this.setField('dayOfWeek', '*'); // Every day of the week
        } else {
            this.setField('dayOfWeek', `${day}`);
        }
        return this;
    }

    /**
     * @description Method to set the specific days of the week in the cron pattern
     * @param days - Array of days
     */
    public specificDayOfWeek(days: CronWeekday[]): CronBuilder {
        if (days.length === 0) {
            throw new Error('No days provided');
        }

        const daysString = days.map((day) => `${day}`).join(',');
        this.setField('dayOfWeek', daysString);
        return this;
    }

    /**
     * @description Method to set the month in the cron pattern
     * If `month()` is called without a parameter, it assumes "every month"
     * @param month - Month
     */
    public month(month?: CronMonth): CronBuilder {
        if (month === undefined) {
            this.setField('month', '*'); // Every month
        } else {
            this.setField('month', `${month}`);
        }
        return this;
    }

    /**
     * @description Method to set the specific months in the cron pattern
     * @param months - Array of months
     */
    public specificMonth(months: CronMonth[]): CronBuilder {
        if (months.length === 0) {
            throw new Error('No months provided');
        }

        const monthsString = months.map((month) => `${month}`).join(',');
        this.setField('month', monthsString);
        return this;
    }

    /**
     * @description Method to set the months range in the cron pattern
     * @param start - Start value
     * @param end - End value
     */
    public specificMonthBetween(start: CronMonth, end: CronMonth): CronBuilder {
        const startMonth = Object.values(CronMonth).indexOf(start);
        const endMonth = Object.values(CronMonth).indexOf(end);

        if (startMonth === -1 || endMonth === -1) {
            throw new Error('Invalid value for months in Cron Pattern');
        }

        this.setField('month', `${start}-${end}`);
        return this;
    }
}

export default CronBuilder;
