import * as schedule from 'node-schedule';
import * as moment from 'moment-timezone';

export const scheduleJob = (rule: string | Date, callback: () => void) => {
  schedule.scheduleJob(rule, callback);
};

export const combineDateAndTime = (
  date: Date | string,
  time: Date | string,
) => {
  const datetimeString = `${date}T${time}`;

  // Parse the combined datetime string into a Moment.js object
  const datetime = moment(datetimeString, 'YYYY-MM-DDTHH:mm');

  // Convert Moment.js object to a native Date object
  const dateTime = datetime.toDate();
  return dateTime;
};
export const calculateTimeBefore = (
  time: string,
  minutesBefore: number,
): string => {
  const inputTime = moment(time, 'HH:mm');
  const timeBefore = inputTime.subtract(minutesBefore, 'minutes');
  return timeBefore.format('HH:mm');
};
