"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "../../../layout";
import Navbar from "../../../_components/Navbar";
import { api } from "~/trpc/react";
import { Button, Carousel, Input, Form } from "antd";
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
  const ruaId: string = params.id;

  const { data: ruaData, refetch: refetchRua } = api.ruas.getRua.useQuery(
    { ruaId: ruaId as string },
    { enabled: !!ruaId }
  );

  const updateRuaMutation = api.ruas.updateRua.useMutation();
  const router = useRouter();
  const { data: session } = useSession();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showAllCasas, setShowAllCasas] = useState(false);
  const carouselRef = useRef<Carousel>(null);

  const [formData, setFormData] = useState<Rua | null>(null);
  if (formData && ruaData) {
    formData.figuras = ruaData.figuras;
  }

  useEffect(() => {
    if (ruaData) {
      setFormData(ruaData);
    }
  }, [ruaData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => prevData ? { ...prevData, [name]: value } : null);
  };

  const handleSubmit = async () => {
    if (!formData) return;

    // Implement the save function using your API
    try {
      await updateRuaMutation.mutateAsync({ ruaId, ...formData });
      refetchRua();
      router.push(`/ruas/${ruaId}`);
    } catch (error) {
      console.error("Failed to update Rua:", error);
    }
  };

  if (!ruaData || !formData) {
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
            <Form layout="vertical" onFinish={handleSubmit}>
              <div className="flex mb-10 mt-4 content-center justify-between">
                <div className="basis-2/3 text-3xl text-left">
                  <Form.Item label="Nome" name="nome">
                    <Input
                      value={formData.nome}
                      name="nome"
                      onChange={handleInputChange}
                      defaultValue={ruaData.nome}
                    />
                  </Form.Item>
                </div>
                <div className="text-center mt-8 mr-8">
                <Button type="primary" htmlType="submit">
                  Save
                </Button>
              </div>
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
                <Form.Item label="Descrição" name="descricao">
                  <Input.TextArea
                    value={formData.descricao}
                    name="descricao"
                    onChange={handleInputChange}
                    rows={10}
                    defaultValue={ruaData.descricao}
                  />
                </Form.Item>
              </div>
              <div className="mt-4 bg-gray-200 p-4 rounded-[40px]">
                <h2 className="text-lg font-bold ml-6">Lista de Casas</h2>
                {(showAllCasas ? formData.casas : formData.casas.slice(0, 2)).map(
                  (casa, index) => (
                    <div className="mt-4" key={casa.id}>
                      <Form.Item label={`Casa número ${casa.numero}`} name={`casa-${index}-descricao`}>
                        <Input.TextArea
                          value={casa.descricao}
                          name={`casa-${index}-descricao`}
                          onChange={handleInputChange}
                          defaultValue={casa.descricao}
                        />
                      </Form.Item>
                      <Form.Item label="Enfiteuta" name={`casa-${index}-enfiteuta`}>
                        <Input
                          value={casa.enfiteuta}
                          name={`casa-${index}-enfiteuta`}
                          onChange={handleInputChange}
                          defaultValue={casa.enfiteuta}
                        />
                      </Form.Item>
                      <Form.Item label="Foro" name={`casa-${index}-foro`}>
                        <Input
                          value={casa.foro}
                          name={`casa-${index}-foro`}
                          onChange={handleInputChange}
                          defaultValue={casa.foro}
                        />
                      </Form.Item>
                    </div>
                  )
                )}
                {formData.casas.length > 3 && (
                  <div className="text-center mt-2">
                    <button
                      className="px-4 py-2 bg-gray-300 border rounded"
                      type="button"
                      onClick={() => setShowAllCasas(!showAllCasas)}
                    >
                      {showAllCasas ? "Ver menos" : "Ver mais"}
                    </button>
                  </div>
                )}
              </div>
            </Form>
          </div>
        </div>
      </main>
    </Layout>
  );
}
