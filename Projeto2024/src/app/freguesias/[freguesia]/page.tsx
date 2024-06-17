"use client";

import { useEffect, useState } from 'react';
import Search from 'antd/es/input/Search';
import Layout from '../../layout';
import Navbar from '../../_components/Navbar';
import RuaCard from '../../_components/RuaCard';
import Pagination from '../../_components/Pagination';
import { api } from '~/trpc/react';

type Rua = {
  id: string;
  nome: string;
  concelho: string;
  freguesia: string;
  descricao: string;
  figuras: Figura[];
  casas: Casa[];
};

type Figura = {
  id: string;
  nome: string;
  path: string;
  legenda: string;
  ruaId: string;
};

type Casa = {
  id: string;
  numero: string;
  enfiteuta: string;
  foro: string;
  descricao: string;
  ruaId: string;
  rua: Rua;
};

type FreguesiaPageProps = {
  params: {
    freguesia: string;
  };
};

export default function FreguesiaPage({ params }: FreguesiaPageProps) {
  const { freguesia } = params;
  const decodedFreguesia = decodeURIComponent(freguesia);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: ruasData, refetch: refetchRuas } = api.ruas.getRuas.useQuery({
    searchTerm,
    freguesia: decodedFreguesia,
  });

  useEffect(() => {
    refetchRuas();
  }, [decodedFreguesia, searchTerm, refetchRuas]);

  const itemsPerPage = 9;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = ruasData?.slice(indexOfFirstItem, indexOfLastItem) || [];

  const totalPages = Math.ceil((ruasData?.length || 0) / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Layout>
      <main className="flex h-screen bg-white text-black">
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <Navbar />
        <div className="flex h-full w-full pt-24">
          <div className="bg-[hsl(206,87%,15%)] border rounded-tl-[40px] w-20 p-4"></div>
          <div className="flex-1 pl-10 pr-10">
            <div className="flex mb-4 content-center">
              <h1 className="basis-2/3 text-3xl font-bold">{decodedFreguesia}</h1>
              <Search
                size="large"
                type="text"
                placeholder="Pesquisar rua"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
                enterButton
                className="w-full p-2"
              />
            </div>
            <div className="grid grid-cols-3 grid-rows-[repeat(3,220px)] gap-y-[20px] gap-x-[40px] flex-1 overflow-visible">
              {currentItems.map((rua) => (
                <RuaCard
                  key={rua.id}
                  rua={rua}
                  level="../"
                />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </main>
    </Layout>
  );
}
