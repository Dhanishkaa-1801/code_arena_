'use client';

import { useState, useEffect } from 'react';

// A placeholder component to show during server render and initial client render
const Placeholder = () => (
  <div className="flex space-x-3 text-center">
    {['days', 'hours', 'minutes', 'seconds'].map((interval) => (
        <div key={interval} className="flex flex-col items-center">
          <span className="text-xl lg:text-2xl font-bold text-gray-100">--</span>
          <span className="text-xs text-gray-400 uppercase">{interval}</span>
        </div>
      ))}
  </div>
);

const calculateTimeLeft = (targetDate: Date) => {
  const difference = +targetDate - +new Date();
  let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }
  return timeLeft;
};

export default function Countdown({ targetDate }: { targetDate: string }) {
  const [isClient, setIsClient] = useState(false);
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(new Date(targetDate)));

  // This useEffect only runs on the client, after the component has "mounted".
  useEffect(() => {
    setIsClient(true);

    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft(new Date(targetDate)));
    }, 1000);
    
    return () => clearTimeout(timer);
  });

  // On the server and during the initial client render, show the placeholder.
  if (!isClient) {
    return <Placeholder />;
  }

  // Once mounted on the client, show the actual countdown.
  return (
    <div className="flex space-x-3 text-center">
      {Object.entries(timeLeft).map(([interval, value]) => (
        <div key={interval} className="flex flex-col items-center">
          <span className="text-xl lg:text-2xl font-bold text-gray-100">{String(value).padStart(2, '0')}</span>
          <span className="text-xs text-gray-400 uppercase">{interval}</span>
        </div>
      ))}
    </div>
  );
}