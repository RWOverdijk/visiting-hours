export class Timezone {
  public static formattersCache: { [key: string]: Intl.DateTimeFormat } = {};

  public static getDateTimeFormat(timeZone: string): Intl.DateTimeFormat {
    if (!Timezone.formattersCache[timeZone]) {
      Timezone.formattersCache[timeZone] = new Intl.DateTimeFormat('en-US', {
        hour12: false,
        timeZone: timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }

    return Timezone.formattersCache[timeZone];
  }

  public static partsOffset(dtf: Intl.DateTimeFormat, date: Date): Formatted {
    return dtf.formatToParts(date).reduce((acc, { type, value }) => {
      if (type !== 'literal') {
        acc[type as keyof Formatted] = +value;
      }

      return acc;
    }, {} as Formatted);
  }

  public static utcToZonedTime(date: Date, timeZone: string): Date {
    const utcDate = new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds()
    );

    const dtf = Timezone.getDateTimeFormat(timeZone);
    const { year, month, day, hour, minute, second } = Timezone.partsOffset(dtf, date);
    const asUTC = Date.UTC(year, month - 1, day, hour, minute, second, 0);
    const timestampWithMsZeroed = date.getTime() - (date.getTime() % 1000);
    const offsetMilliseconds = -(asUTC - timestampWithMsZeroed);

    return offsetMilliseconds ? new Date(utcDate.getTime() + (-offsetMilliseconds)) : utcDate;
  }
}

type Formatted = { year: number, month: number, day: number, hour: number, minute: number, second: number };