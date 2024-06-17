"use client";

import React from "react";
import Link from "next/link";

type Rua = {
  id: string;
  nome: string;
  figuras: Figura[];
};

type Figura = {
  id: string;
  nome: string;
  path: string;
  legenda: string;
  ruaId: string;
};

type RuaCardProps = {
  rua: Rua;
  level: string;
};

const RuaCard: React.FC<RuaCardProps> = ({ rua , level}) => {
  // Ensure the image path is an absolute URL
  const getImageUrl = (path: string) => {
    try {
      return new URL(path, process.env.NEXT_PUBLIC_BASE_URL).toString();
    } catch (error) {
      console.error("Invalid image path:", error);
      return path; // Fallback to the original path if URL construction fails
    }
  };

  if (!rua.figuras[0]) throw new Error("Rua must have at least one image");

  return (
    <Link href={`/ruas/${rua.id}`}>
      <div className="bg-gray-100 border rounded-[40px] overflow-hidden cursor-pointer transform transition-all hover:scale-105">
        <h3 className="truncate text-lg h-[50px] font-bold text-center pr-6 pt-4 pl-6">
          {rua.nome}
        </h3>
        {rua.figuras.length > 0 && (
          <img
            src={getImageUrl(level+rua.figuras[0].path)}
            alt={rua.figuras[0]?.nome}
            className="w-full h-[170px] object-cover mt-2"
          />
        )}
      </div>
    </Link>
  );
};

export default RuaCard;