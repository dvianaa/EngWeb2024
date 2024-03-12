import json

def parseJSON(jsonFile):
    with open(jsonFile, "r") as jsonInputFile:
        data = [json.loads(line) for line in jsonInputFile]
    return data

# def lista_filmes(data, )

def simplify_id(data):
    single_list = []
    for item in data:
        if '_id' in item:
            item['id'] = str(item.pop('_id')['$oid'])
        single_list.append(item)

    return single_list

#dá return do dicionario de atores, sendo que cada ator é um dicionário por si só
def get_actors(data):
    #id que vai ser atribuido a cada actor
    actual_id = 0
    #dicionario de atores que vai ser returned
    output = dict()
    for line in data:
        #se o filme tem atores associados
        if 'cast' in line and len(line['cast']) > 0:
            for actor in line['cast']:
                #se o ator já existe, então atualiza os seus filmes
                if actor in output:
                    output[actor]['movies'].append((line['id'], line['title']))
                #se não existe, adiciona o ator e atualiza os seus filmes
                else:
                    actual_id += 1
                    output[actor] = {'id':actual_id, 'name':actor, 'movies':[(line['id'], line['title'])]}
    return output

def get_genres(data):
    actual_id = 0 #id que vai ser atribuido aos géneros conforme são criados
    output = dict()
    for line in data:
        #verifica se o filme tem géneros associados
        if 'genres' in line and len(line['genres']) > 0:
            for genre in line['genres']:
                #se já existe o género, só associa o filme aos já existentes
                if genre in output:
                    output[genre]['movies'].append((line['id'], line['title']))
                #se não existe, cria o género e associa o filme
                else:
                    actual_id += 1
                    output[genre] = {'id':actual_id, 'genreName':genre, 'movies':[(line['id'], line['title'])]}
    return output


def get_movies(data, genres_dict, actors_dict):
    updated_movies = []

    for movie in data:
        updated_movie = movie.copy()

        # atualiza info dos generos
        updated_movie['genres'] = [(genres_dict[genre]['id'], genres_dict[genre]['genreName']) for genre in movie.get('genres', [])]

        # atualiza info dos atores
        updated_movie['cast'] = [(actors_dict[actor]['id'], actors_dict[actor]['name']) for actor in movie.get('cast', [])]

        # Aadiciona a lista nova
        updated_movies.append(updated_movie)

    return updated_movies

def main():
    data = simplify_id(parseJSON('filmes.json'))
    
    
    
    genresDic = get_genres(data)
    actorsDic = get_actors(data)
    updated_movies = get_movies(data, genresDic, actorsDic)
    
    output = {'movies':updated_movies, 'genres': list(genresDic.values()),'actors': list(actorsDic.values())}
    
    
    outputFile = open('movies.json',"w")
    json.dump(output,outputFile,indent=4)
    

if __name__ == "__main__":
    main()