import dayjs from 'dayjs';
import { eachDayOfInterval, format } from 'date-fns';

export const TimeDisplay = (rawTime: any) => {
  if (!rawTime) return "N/A";

  try {
    // Handle different time formats
    let timeString = rawTime;

    // If it's an object with hour/minute properties (LocalTime)
    if (typeof rawTime === 'object' && rawTime.hour !== undefined) {
      const hour = rawTime.hour || 0;
      const minute = rawTime.minute || 0;
      timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
    }

    // If it's already a formatted time string like "HH:mm:ss"
    if (typeof timeString === 'string' && timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
      const [hours, minutes] = timeString.split(':');
      const hour12 = parseInt(hours) % 12 || 12;
      const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${ampm}`;
    }

    // Fallback: try dayjs parsing
    const date = dayjs(timeString);
    if (date.isValid()) {
      return date.format('hh:mm A');
    }

    return "N/A";
  } catch (error) {
    return "N/A";
  }
}

export const formatTime = (time:any) => {

  if (!time) {
    return "Time not provided";
  }

  const hour = time.hour ?? 0;
  const minute = time.minute ?? 0;
  const second = time.second ?? 0;

  const pad = (num:any) => num.toString().padStart(2, '0');

  let timeString = `${pad(hour)}:${pad(minute)}:${pad(second)}`;

  if (time.nano !== undefined) {
    timeString += `.${time.nano}`;
  }

  return timeString;
}


export const DateTimeDisplay = (dateString : string) => {
  const date = new Date(dateString);

  const readableDateTime = date.toLocaleString(navigator.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return readableDateTime;
};


export const DateTimeWSDisplay = (dateString : string) => {
  const date = new Date(dateString);

  const readableDateTime = date.toLocaleString(navigator.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });

  return readableDateTime;
};

export const DateDisplay = (dateString : string) => {
  if (!dateString) return "N/A";
  
  try {
    // Use dayjs for better parsing
    const date = dayjs(dateString);
    if (!date.isValid()) {
      return "Invalid Date";
    }
    return date.format('MMMM D, YYYY');
  } catch (error) {
    return "Invalid Date";
  }
};


export const getDatesBetween = (startDateString: string , endDateString: string) => {

  const startDate = new Date(startDateString);
  const endDate = new Date(endDateString);

  const datesInterval = eachDayOfInterval({ start: startDate, end: endDate });

  return datesInterval.map(date => format(date, 'yyyy-MM-dd'));
};
