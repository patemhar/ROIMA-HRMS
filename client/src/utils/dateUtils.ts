import dayjs from 'dayjs';

export const TimeDisplay = (rawTime: any) => {

  const formattedTime = dayjs(rawTime, "HH:mm:ss").format("hh:mm A");
  
  return formattedTime;
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

export const DateDisplay = (dateString : string) => {
  const date = new Date(dateString);

  const readableDateTime = date.toLocaleString(navigator.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return readableDateTime;
};