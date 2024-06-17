"use client";

import { NextPage } from "next";
import Layout from "../../../layout";
import Navbar from "../../../_components/Navbar";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import RuaCard from "~/app/_components/RuaCard";
import { useSession } from "next-auth/react";

interface User {
  id: string;
  username: string | null;
  imageProfile: string | null;
}

interface UserData {
  id: string;
  username: string | null | undefined;
  imageProfile: string | null | undefined;
}

interface Rua {
  id: string;
  name: string;
  image: string | null;
}

const CreatePostPage: NextPage = () => {
  const params = useParams();
  const ruaID = params.id;
  
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [rua, setRua] = useState<Rua | null>(null);
  const [content, setContent] = useState("");
  const session = useSession();

  const createPost = api.posts.createPostMutation.useMutation();



  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await api.user.getCurrentUser.useQuery().data;
        if (userData) {
          const { id, username, imageProfile } = userData as UserData;
          setUser({
            id: id,
            username: username ?? null,
            imageProfile: imageProfile ?? null,
          });
        } else {
          router.push("/register");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  const { data: ruaData, refetch: refetchRua } = api.ruas.getRua.useQuery(
    { ruaId: ruaID as string },
    { enabled: !!ruaID }
  );

  useEffect(() => {
    if (ruaData) {
      setRua({
        id: ruaData.id,
        name: ruaData.nome,
        image: ruaData.figuras[0]?.path ?? null,
      });
    }
  }, [ruaData]);

  if (!ruaData) {
    return <div>Loading rua...</div>;
  }

  const transformedRuaData = {
    ...ruaData,
    figuras: ruaData.figuras.map(figura => ({
      ...figura,
      path: `/../../${figura.path}`,
    })),
  };
  

  if (!ruaData) {
    return <div>Loading rua...</div>;
  }

  const handlePostSubmit = async () => {
    try {
      if (!content || !rua) {
        console.error("Content or Rua not found");
        if (!content) {
          alert("Content is required!");
        }
        if (!rua) {
          alert("Rua is required!");
        }
        return;
      }
      const { success, postID } = await createPost.mutateAsync({ content: content, ruaid: rua?.id });


      if (success) {
        router.push(`/posts/${postID}`);
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleButtonClick = () => {
    router.push('/ruas');
  };

  return (
    <Layout>
      <div className="flex flex-col h-screen w-full bg-white text-black overflow-hidden">
        <Navbar />
        <main className="flex h-full w-full">
        <div className="flex h-full w-full pt-24">
          <div className="bg-[hsl(206,87%,15%)] border rounded-tl-[40px] w-20 p-4 h-screen sticky top-0"></div>
          <div className="flex-1 flex justify-between items-center p-10">
            <div className="flex flex-col items-start w-1/3">
              <h1 className="text-3xl font-bold mb-4">Cria um novo Post</h1>
              <div className="flex space-x-4 items-center w-full">
                <div className="bg-gray-300 w-16 h-16 rounded-full overflow-hidden">
                  {user?.imageProfile && (
                    <img
                      src={user?.imageProfile ?? undefined}
                      alt={user.username ?? "User"}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <h2 className="text-2xl font-bold">@{session.data?.user.name}</h2>
              </div>
              <textarea
                className="w-full mt-2 p-4 border border-gray-300 rounded-lg h-48"
                placeholder="Escreve o teu post aqui..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              ></textarea>
              <div className="flex mt-4 space-x-2">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  onClick={handlePostSubmit}
                >
                  Publicar
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  onClick={handleButtonClick}
                >
                  Cancelar
                </button>
              </div>
            </div>
            <div className="w-1/2">
              <div className="transform scale-150 pr-40">
                <RuaCard key={transformedRuaData.id} rua={transformedRuaData} level=""/>
              </div>
            </div>
          </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};  


export default CreatePostPage;