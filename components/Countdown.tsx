// components/Countdown.tsx
'use client';

import { useState, useEffect } from 'react';

// This function calculates the remaining time and returns it.
const calculateTimeLeft = (endTime: string) => {
  const difference = +new Date(endTime) - +new Date();
  let timeLeft = {
    hours: 0,
    minutes: 0,
    seconds: 0,
  };

  if (difference > 0) {
    timeLeft = {
      // We add days to hours in case a contest spans more than 24 hours
      hours: Math.floor(difference / (1000 * 60 * 60)),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  return timeLeft;
};

// The component now takes an `endTime` prop for clarity
export default function Countdown({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endTime));
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This ensures this code only runs on the client, preventing hydration errors
    setIsClient(true);
    
    // Using setInterval to update the timer every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endTime));
    }, 1000);

    // Clean up the interval when the component is unmounted
    return () => clearInterval(timer);
  }, [endTime]); // The effect re-runs if the endTime prop changes

  const isFinished = Object.values(timeLeft).every(val => val === 0);

  if (isFinished) {
    return (
      <div className="text-2xl font-bold text-red-500 animate-pulse">
        Contest Over
      </div>
    );
  }

  // On the server or before the client has mounted, show a simple placeholder
  if (!isClient) {
    return <div className="font-mono text-2xl font-bold text-white tracking-widest">--:--:--</div>;
  }

  // Helper to format the time values with a leading zero if needed
  const formatTime = (time: number) => String(time).padStart(2, '0');

  return (
    <div className="font-mono text-2xl font-bold text-white tracking-widest">
      <span>{formatTime(timeLeft.hours)}</span>:
      <span>{formatTime(timeLeft.minutes)}</span>:
      <span>{formatTime(timeLeft.seconds)}</span>
    </div>
  );
}