"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "../../layout";
import Navbar from "../../_components/Navbar";
import { api } from "~/trpc/react";
import { Button, Carousel, Alert } from "antd";
import { useSession } from "next-auth/react";

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

type Post = {
  id: string;
  name: string;
  createdAt: string;
  createdBy: User;
  likes: number;
};

type User = {
  id: string;
  name: string;
};

export default function RuaPage() {
  const params = useParams();
  const ruaId = params.id;
  
  const deleteMutation = api.ruas.deleteRua.useMutation();
  const { data: ruaData, refetch: refetchRua } = api.ruas.getRua.useQuery(
    { ruaId: ruaId as string },
    { enabled: !!ruaId }
  );

  const router = useRouter();
  const session = useSession();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showAllCasas, setShowAllCasas] = useState(false);
  const carouselRef = useRef<Carousel>(null);

  if (!ruaData) {
    return <div>A carregar...</div>;
  }


  return (
    <Layout>
      <main className="flex h-full w-full bg-white text-black">
        <Navbar />
        <div className="flex w-full pt-24">
          <div className="bg-[hsl(206,87%,15%)] border rounded-tl-[40px] w-20 p-4 h-screen sticky top-0">
          </div>
          <div className="flex-1 w-full pl-10 pr-10">
            <div className="flex mb-10 mt-4 content-center">
              <div className="basis-2/3 text-3xl font-bold text-left">
                {ruaData.nome}
              </div>
              {
                (session.data) ? (
                  <Button onClick={() => {router.push("/posts/create/" + ruaId)}} className="text-blue-500">Adicionar Post</Button>
                ) : null
              }
              <div className="basis-1/2 text-lg text-right">
                {ruaData.freguesia}
              </div>
              {
                (session.data && (session.data.user.role === "admin")) ? (
                  <div className="flex ml-8 mr-2 gap-2">
                    <Button onClick={() => {router.push('/ruas/editar/' + ruaId)}} className="text-blue-500">Editar</Button>
                    <Button onClick={async () => {
                      if (ruaData.id) await deleteMutation.mutate({ ruaId: ruaData.id })
                      router.push('/ruas');
                    }} className="text-red-500">Apagar</Button>
                  </div>
                  
                ) : null
              }{
                deleteMutation.isSuccess && (
                  <Alert
                    message="Rua apagada com sucesso!"
                    type="success"
                    showIcon
                    closable
                    style={{ marginTop: 20 }}
                  />
              )}
            </div>
            <div className="flex justify-center mb-4">
              <div className="w-[1300px] relative">
                <Carousel dots={false} ref={carouselRef}>
                  {ruaData.figuras.map((figura) => (
                    <div key={figura.id}> 
                        <div className="flex justify-center">
                        <img
                            src={`/../${figura.path}`}
                            alt={figura.nome}
                            className="h-[250px] object-cover"
                        />   
                        </div> 
                        <div className="text-center">{figura.legenda}</div>
                    </div>
                  ))}
                </Carousel>
                <button
                  onClick={() => carouselRef.current?.prev()}
                  className="text-xl text-bold absolute left-[-50px] top-1/2 transform -translate-y-1/2 bg-gray-300 p-2 rounded-full"
                >
                  &lt;
                </button>
                <button
                  onClick={() => carouselRef.current?.next()}
                  className="text-xl text-bold absolute right-[-50px] top-1/2 transform -translate-y-1/2 bg-gray-300 p-2 rounded-full"
                >
                  &gt;
                </button>
              </div>
            </div>
            <div className="mt-4 mb-10">
              <h2 className="text-xl font-bold mb-6">Descrição</h2>
              <p className="text-justify indent-8">
                {showFullDescription
                  ? ruaData.descricao
                  : `${ruaData.descricao.substring(0, 600)}...`}
                  <button
                    className="ml-4 text-blue-500"
                    onClick={() => setShowFullDescription(!showFullDescription)}
                >
                    {showFullDescription ? "Ver menos" : "Ver mais"}
                </button>
              </p>
            </div>
            <div className="mt-4 bg-gray-200 p-4 rounded-[40px]">
              <h2 className="text-lg font-bold ml-6">Lista de Casas</h2>
              {(showAllCasas ? ruaData.casas : ruaData.casas.slice(0, 2)).map(
                (casa, index) => (
                  <div className="mt-4" key={casa.id}>
                    <p className="ml-6">
                      <b>{`Casa número ${casa.numero}:`}</b>
                    </p>
                    <p className="ml-8">{`${casa.descricao}`}</p>
                    <p className="ml-8">
                      <b>Enfiteuta:</b> {casa.enfiteuta}
                    </p>
                    <p className="ml-8">
                      <b>Foro:</b> {casa.foro}
                    </p>
                  </div>
                )
              )}
              {ruaData.casas.length > 3 && (
                <div className="text-center mt-2">
                  <button
                    className="px-4 py-2 bg-gray-300 border rounded"
                    onClick={() => setShowAllCasas(!showAllCasas)}
                  >
                    {showAllCasas ? "Ver menos" : "Ver mais"}
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="w-[320px] p-4 border rounded-tl-[40px] bg-gray-100 h-screen sticky top-0">
            <div className="pl-10">
              <h2 className="text-lg font-bold">Posts sobre a rua</h2>
              {/* {topPostData && (
                <div className="mt-4 bg-gray-100 p-4 rounded">
                  <p className="font-bold">{topPostData.name}</p>
                  <p>{`Likes: ${topPostData.likes}`}</p>
                  <p>{`By: ${topPostData.createdBy.name}`}</p>
                </div>
              )} */}
              <div className="text-center mt-2">
                <button className="px-4 py-2 bg-gray-300 border rounded">
                  Ver mais
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
