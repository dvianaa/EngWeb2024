"use client";

import { useState, useEffect } from "react";
import Search from 'antd/es/input/Search';
import Layout from "../layout";
import Navbar from "../_components/Navbar";
import FreguesiaCard from "../_components/FreguesiaCard"; 
import Pagination from "../_components/Pagination";
import { api } from "~/trpc/react";

type Freguesia = {
  freguesia: string;
  concelho: string;
};

type Concelho = {
  concelho: string;
};

export default function Home() {
  const [filteredFreguesias, setFilteredFreguesias] = useState<Freguesia[]>([]);
  const [selectedConcelho, setSelectedConcelho] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: freguesiasData, refetch: refetchFreguesias } = api.freguesias.getFreguesias.useQuery({
    searchTerm,
    concelho: selectedConcelho
  });
  const { data: concelhos } = api.freguesias.getConcelhos.useQuery();

  useEffect(() => {
    if (freguesiasData) {
      const sortedFreguesias = freguesiasData.slice().sort((a, b) => a.freguesia.localeCompare(b.freguesia));
      setFilteredFreguesias(sortedFreguesias);
    }
  }, [freguesiasData]);

  useEffect(() => {
    refetchFreguesias();
  }, [selectedConcelho, searchTerm, refetchFreguesias]);

  useEffect(() => {
    if (freguesiasData) {
      let filtered = freguesiasData;

      if (selectedConcelho) {
        filtered = filtered.filter((freguesia) => freguesia.concelho === selectedConcelho);
      }

      setFilteredFreguesias(filtered);
      setCurrentPage(1); // Reset para a primeira página quando os filtros mudam
    }
  }, [selectedConcelho, searchTerm, freguesiasData]);

  const itemsPerPage = 12;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFreguesias.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredFreguesias.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleClearFilters = () => {
    setSelectedConcelho("");
    setSearchTerm("");
    setFilteredFreguesias(freguesiasData || []);
  };

  return (
    <Layout>
      <main className="flex h-screen bg-white text-black">
        <Navbar />
        <div className="flex h-full w-full pt-24">
          <div className="bg-[hsl(206,87%,15%)] border rounded-tl-[40px] w-20 p-4"></div>
          <div className="flex-1 pl-10 pr-10">
            <div className="flex mb-4 content-center">
              <h1 className="basis-2/3 text-3xl font-bold">Freguesias</h1>
              <Search
                size="large"
                type="text"
                placeholder="Pesquisar freguesia"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
                enterButton
                className="w-full p-2"
              />
            </div>
            <div className="grid grid-cols-3 grid-rows-[repeat(4,150px)] gap-y-[20px] gap-x-[40px] flex-1 overflow-visible">
              {currentItems.map((freguesia) => (
                <FreguesiaCard
                  key={freguesia.freguesia}
                  freguesia={freguesia.freguesia}
                  onClick={() => {
                    // Implementar a navegação para a página da freguesia aqui
                    console.log(`Clicou na freguesia ${freguesia.freguesia}`);
                  }}
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
