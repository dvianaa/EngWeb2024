"use client";

import { useState, useEffect } from "react";
import Search from 'antd/es/input/Search';
import Layout from "../layout";
import Navbar from "../_components/Navbar";
import RuaCard from "../_components/RuaCard";
import Pagination from "../_components/Pagination";
import { api } from "~/trpc/react";

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
};

type Freguesia = {
  freguesia: string;
};

type Concelho = {
  concelho: string;
};

export default function Home() {
  const [ruas, setRuas] = useState<Rua[]>([]);
  const [filteredRuas, setFilteredRuas] = useState<Rua[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFreguesia, setSelectedFreguesia] = useState("");
  const [selectedConcelho, setSelectedConcelho] = useState("");
  const [numCasas, setNumCasas] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: ruasData, refetch: refetchRuas } = api.ruas.getRuas.useQuery({
    searchTerm,
    freguesia: selectedFreguesia,
    concelho: selectedConcelho,
    numCasas: parseInt(numCasas) || 0,
  });

  const { data: freguesias } = api.ruas.getFreguesias.useQuery();
  const { data: concelhos } = api.ruas.getConcelhos.useQuery();

  useEffect(() => {
    if (ruasData) {
      const sortedRuas = ruasData.slice().sort((a, b) => a.nome.localeCompare(b.nome));
      setRuas(sortedRuas);
      setFilteredRuas(sortedRuas);
    }
  }, [ruasData]);

  useEffect(() => {
    refetchRuas();
  }, [searchTerm, selectedFreguesia, selectedConcelho, numCasas]);

  useEffect(() => {
    let filtered = ruas;

    if (numCasas) {
      filtered = filtered.filter((rua) => rua.casas.length === parseInt(numCasas));
    }

    setFilteredRuas(filtered);
    setCurrentPage(1); // Reset to the first page when filters change
  }, [numCasas, ruas]);

  const itemsPerPage = 9;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRuas.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredRuas.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedFreguesia("");
    setSelectedConcelho("");
    setNumCasas("");
    setFilteredRuas(ruas); // Reset filteredRuas to original ruas
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
              <h1 className="basis-2/3 text-3xl font-bold">Ruas de Braga</h1>
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
                  level=""
                />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
          <div className="w-[320px] p-4 border rounded-tl-[40px] bg-gray-100">
            <h2 className="text-lg font-bold mb-4 pl-4">Filtros</h2>
            <div className="mb-4">
              <label className="block mb-2">Freguesia</label>
              <select
                value={selectedFreguesia}
                onChange={(e) => setSelectedFreguesia(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Todas</option>
                {freguesias?.map((freguesia) => (
                  <option
                    key={freguesia.freguesia}
                    value={freguesia.freguesia}
                  >
                    {freguesia.freguesia}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-2">Concelho</label>
              <select
                value={selectedConcelho}
                onChange={(e) => setSelectedConcelho(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Todos</option>
                {concelhos?.map((concelho) => (
                  <option key={concelho.concelho} value={concelho.concelho}>
                    {concelho.concelho}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-2">Número de casas</label>
              <input
                type="number"
                min="1"
                max="10"
                value={numCasas}
                onChange={(e) => setNumCasas(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="text-center">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-200 border rounded"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}