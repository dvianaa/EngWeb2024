// FreguesiaCard.tsx

import React from "react";
import Link from 'next/link';

type FreguesiaCardProps = {
  freguesia: string;
  onClick: () => void;
};

const FreguesiaCard: React.FC<FreguesiaCardProps> = ({ freguesia, onClick }) => {
  const encodedFreguesia = encodeURIComponent(freguesia);

  return (
    <Link href={`/freguesias/${encodedFreguesia}`}>
      <div
        className="flex-row bg-gray-100 h-[150px] border rounded-[40px] justify-center content-center cursor-pointer transform transition-all hover:scale-105"
        onClick={onClick}
      >
        <div className="flex truncate text-lg font-bold justify-center content-center">{freguesia}</div>
      </div>
    </Link>
  );
};

export default FreguesiaCard;
