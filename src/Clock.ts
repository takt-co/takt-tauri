export type Clock = {
  hours: string,
  minutes: string,
  seconds: string
}

export const secondsToClock = (seconds: number) => {
  if (seconds === 0) {
    return { hours: "0", minutes: "00", seconds: "00" }
  }

  const hours = Math.floor(seconds / 60 / 60);
  seconds = seconds - (hours * 60 * 60);

  let mins = Math.floor(seconds / 60);
  if (mins < 0) mins = 0;
  let minutes = String(mins);
  if (minutes.length === 1) minutes = `0${minutes}`;

  let secs = seconds - parseInt(minutes) * 60;
  if (secs < 0) secs = 0;
  let secondsStr = String(secs);
  if (secondsStr.length === 1) secondsStr = `0${secondsStr}`;

  return { hours: String(hours), minutes, seconds: secondsStr } as Clock;
};

export const clockToSeconds = (clock: Clock) => {
  const hours = parseInt(clock.hours) * 60 * 60;
  const minutes = parseInt(clock.minutes) * 60;
  return hours + minutes + parseInt(clock.seconds);
}
