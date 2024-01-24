import * as moment from 'moment-timezone';
export const AppointmentStatus = {
  NOT_CONFIRMED: 'NOT_CONFIRMED',
  CONFIRMED: 'CONFIRMED',
  CANCEL: 'CANCEL',
  COMPLETED: 'COMPLETED',
};

export function mapDateToNumber(date: string): number {
  const dayOfWeek = moment(date).isoWeekday();
  return dayOfWeek === 7 ? 1 : dayOfWeek + 1;
}
