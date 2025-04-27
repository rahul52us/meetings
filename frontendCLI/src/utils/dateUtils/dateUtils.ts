import moment from 'moment';

export const SHORT_DATE_FORMAT: string = 'MMM D, YYYY';
export const MEDIUM_DATE_FORMAT: string = 'MMMM D, YYYY';
export const LONG_DATE_FORMAT: string = 'dddd, MMMM D, YYYY';
export const DDMMYYYY_FORMAT: string = 'DD/MM/YYYY';
export const YYYYMMDD_FORMAT: string = 'YYYY/MM/DD';

export enum DateTimeOrder {
  DateFirst = 'DateFirst',
  TimeFirst = 'TimeFirst',
}

export function formatDate(date: string, format?: string): string {
  const momentDate = moment(date);

  if (!momentDate.isValid()) {
    return '-';
  }
  return moment(date).format(format || DDMMYYYY_FORMAT);
}

export function formatDateTime(
  timestamp: string,
  format?: string,
  includeSeconds: boolean = true,
  dateTimeOrder?: DateTimeOrder,
): string {
  if (timestamp) {
    const order = dateTimeOrder || DateTimeOrder.DateFirst;
    const dateFormat = format || DDMMYYYY_FORMAT;
    const timeFormat = includeSeconds ? 'h:mm:ss A' : 'h:mm A';

    const dateTimeFormat =
      order === DateTimeOrder.DateFirst
        ? `${dateFormat}, ${timeFormat}`
        : `${timeFormat}, ${dateFormat}`;

    const formattedDateTime = moment(timestamp).format(dateTimeFormat);
    return formattedDateTime;
  } else {
    return '-';
  }
}

export function getCustomTextDate(
  title: string,
  dateString: any,
  format?: string,
) {
  try {
    const date = moment.utc(dateString);
    const formattedDate = date.format(format || SHORT_DATE_FORMAT);
    return `${title} ${formattedDate}`;
  } catch (_) {
    return ``;
  }
}

export const currentFullDate = moment();

const currentDates = moment();
export const currentYear = currentDates.format('YYYY');
export const currentMonth = currentDates.format('MM');
export const currentDate = currentDates.format('DD');
