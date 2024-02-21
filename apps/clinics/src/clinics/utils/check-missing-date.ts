import { find } from 'lodash';
import * as moment from 'moment-timezone';

export interface DataItem {
  date: string;
  numberOfPatients: number;
  numberOfAppointments: number;
  revenue: number;
}

export function checkAndInsertMissingDates(
  startDate: Date | string,
  endDate: Date | string,
  data: DataItem[],
): DataItem[] {
  const newData: DataItem[] = [];

  const dateMap: { [date: string]: boolean } = {};
  data.forEach((item) => (dateMap[item.date] = true));

  const currentDate = moment(startDate);

  while (currentDate <= moment(endDate)) {
    const currentDateStr = currentDate.format('YYYY-MM-DD');
    newData.push(
      dateMap[currentDateStr]
        ? {
            ...find(data, { date: currentDateStr }),
            date: moment(currentDate).format('MMM DD'),
          }
        : {
            date: moment(currentDate).format('MMM DD'),
            numberOfPatients: 0,
            numberOfAppointments: 0,
            revenue: 0,
          },
    );
    currentDate.add(1, 'day');
  }

  return newData;
}
