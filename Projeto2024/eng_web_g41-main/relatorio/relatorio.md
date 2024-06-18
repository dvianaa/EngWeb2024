# Introdução

Este relatório detalha o processo de desenvolvimento do projeto da cadeira de Engenharia Web 2023/24. A aplicação desenvolvida permite aos utilizadores visualizar, comentar e interagir com posts sobre determinadas ruas, ao mesmo tempo que exploram diferentes ruas e as suas informações. A aplicação foi desenvolvida utilizando a T3 stack, uma stack de desenvolvimento que incorpora tecnologias modernas e robustas para o desenvolvimento de aplicações web.

## Utilização

Para correr a aplicação é necessário ter o docker e docker-compose instalados. Para correr a aplicação basta correr os seguintes comandos:
```bash
docker-compose up --build

docker exec -it web sh -c "npx prisma migrate dev; cd prisma && node seed.js"
```

A aplicação estará disponível em `http://localhost:3000`

## Credenciais de teste

Para testar a aplicação, pode utilizar as seguintes credenciais:

- **Utilizador**: 
  - username: johndoe
  - password: password
- **Administrador**:
  - username: admin
  - password: admin123

## Tratamento da dataset

### Verificar
De modo a transformarmos os ficheiros presentes no .zip numa estrutura json bem definida tivemos de resolver alguns problemas e explorar um pouco os ficheiros xml.
Com a ajuda de um script em python, pudemos verificar os ficheiros xml contra o xsd fornecido de forma a validar os xmls. Para futura aplicação de taxonomia foram implementados ao xsd e xmls os campos freguesia e concelho.
Quando um ficheiro não é válido o programa avisa onde é que se encontram os erros nas páginas em questão.
Programa verification.xsd:
``` py
from lxml import etree
import os

xsd_path = 'MRB-rua.xsd'
index_path = 'indiceruas.xml'

with open(xsd_path, 'rb') as xsd_file:
    xsd_doc = etree.XML(xsd_file.read())
    xsd_schema = etree.XMLSchema(xsd_doc)


def validate_xml(xml_path):
    with open(xml_path, 'rb') as xml_file:
        xml_doc = etree.XML(xml_file.read())
        if xsd_schema.validate(xml_doc):
            print(f"{xml_path} is valid.")
        else:
            print(f"{xml_path} is invalid!")
            log = xsd_schema.error_log
            print(log)


index_tree = etree.parse(index_path)
index_root = index_tree.getroot()

for rua in index_root.findall('rua'):
    doc_path = rua.get('doc')
    validate_xml(doc_path)
```


### Transformação json
Posteriormente, com todos os xmls validados passamos ao processo de transformar os xmls em json. Utilizando outro script em python fazemos as transformações necessárias para transformar em json, incluindo ainda pths adicionais para as imagens presentes na pasta `atual`. Decidimos ignorar as tags com entidade e não inseri-las assim como campos no json, apesar destas continuarem nos textos.
O output em json terá o seguinte resultado:
```json
[
    {
        "_id": numero rua,
        "nome": nome rua,
        "concelho": concelho,
        "freguesia": freguesia,
        "figuras": [
            {
                "nome": nome ficheiro,
                "path": path da imagem,
                "legenda": legenda da imagem
            },
            ...
        ],
        "descricao": descrição da rua,
        "casas": [
            {
                "numero": numero casa,
                "enfiteuta": enfiteuta,
                "foro": foro,
                "descricao": descrição casa"
            },
            ...
        ]
    },
    ...
]
```

Script xml_to_json.py:
```py
import re
import xml.etree.ElementTree as ET
import os
import json

def transformar_compostos(texto):
    resultado = texto[0]
    for i in range(1, len(texto)):
        if texto[i].isupper():
            resultado += ' ' + texto[i]
        else:
            resultado += texto[i]

    return resultado

def addImagemAtual(figuras, input_file):
    nome_arquivo_base = os.path.splitext(os.path.basename(input_file))[0].split('-')[-1]
    numero_arquivo_base_xml = os.path.splitext(os.path.basename(input_file))[0].split('-')[1]

    numero_arquivo_base_imagens = str(int(numero_arquivo_base_xml))

    padrao_numero_imagem_1 = re.compile(r'{}-.*?-Vista\d+\.(jpg|jpeg|png|gif)'.format(re.escape(numero_arquivo_base_xml)), re.IGNORECASE)
    padrao_numero_imagem_2 = re.compile(r'{}-.*?-Vista\d+\.(jpg|jpeg|png|gif)'.format(re.escape(numero_arquivo_base_imagens)), re.IGNORECASE)

    arquivos_atual = os.listdir('./atual')

    for nome_arquivo in arquivos_atual:
        if padrao_numero_imagem_1.match(nome_arquivo) or padrao_numero_imagem_2.match(nome_arquivo):
            print(nome_arquivo)
            extensao = os.path.splitext(nome_arquivo)[1]
            nome_sem_extensao = os.path.splitext(nome_arquivo)[0]

            figura = {
                "nome": nome_sem_extensao,
                "path": os.path.join('imgs', nome_arquivo),
                "legenda": f'Vista Atual da {transformar_compostos(nome_arquivo_base)}'
            }

            figuras.append(figura)

    return figuras



def extract_text(element):
    """Extracts all text from an element, including text content from nested elements."""
    text = []
    if element.text:
        text.append(element.text.strip())
    for sub_element in element:
        text.append(extract_text(sub_element))
        if sub_element.tail:
            text.append(sub_element.tail.strip())
    return ' '.join(text).strip()

def process_xml_file_to_dict(input_file):
    tree = ET.parse(input_file)
    root = tree.getroot()

    result = {}

    # Meta information
    meta = root.find('meta')
    if meta is not None:
        numero = meta.find('número')
        nome = meta.find('nome')
        concelho = meta.find('concelho')
        freguesia = meta.find('freguesia')
        if numero is not None and numero.text is not None:
            result['_id'] = numero.text.strip()
        if nome is not None and nome.text is not None:
            result['nome'] = nome.text.strip()
        if concelho is not None and concelho.text is not None:
            result['concelho'] = concelho.text.strip()
        if freguesia is not None and freguesia.text is not None:
            result['freguesia'] = freguesia.text.strip()

    # Corpo information
    corpo = root.find('corpo')
    if corpo is not None:
        figuras = []
        descricao = []
        casas = []

        addImagemAtual(figuras, input_file);
        for child in corpo:
            if child.tag == 'para':
                descricao.append(extract_text(child))
            elif child.tag == 'figura':
                figura = {
                    "nome": child.get('id'),
                    "path": os.path.join("imgs",child.find('imagem').get('path').split('/')[-1]) if child.find('imagem') is not None else '',
                    "legenda": child.find('legenda').text.strip() if child.find('legenda') is not None else ''
                }
                figuras.append(figura)
            elif child.tag == 'lista-casas':
                for casa in child.findall('casa'):
                    casa_dict = {}
                    numero = casa.find('número')
                    enfiteuta = casa.find('enfiteuta')
                    foro = casa.find('foro')
                    
                    casa_dict['numero'] = numero.text.strip() if numero is not None and numero.text is not None else ''
                    casa_dict['enfiteuta'] = enfiteuta.text.strip() if enfiteuta is not None and enfiteuta.text is not None else ''
                    casa_dict['foro'] = foro.text.strip() if foro is not None and foro.text is not None else ''
                    
                    desc = casa.find('desc')
                    if desc is not None:
                        casa_descricao = []
                        for para in desc.findall('para'):
                            casa_descricao.append(extract_text(para))
                        casa_dict['descricao'] = ' '.join(casa_descricao)

                    casas.append(casa_dict)

        result['figuras'] = figuras
        result['descricao'] = ' '.join(descricao)
        result['casas'] = casas

    return result

def save_dict_to_json(data, output_file):
    if os.path.exists(output_file):
        with open(output_file, 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
    else:
        existing_data = []

    existing_data.append(data)

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(existing_data, f, ensure_ascii=False, indent=4)

input_dir = './texto'
output_json = 'output.json'

for filename in sorted(os.listdir(input_dir)):
    if filename.endswith('.xml'):
        input_file = os.path.join(input_dir, filename)
        xml_dict = process_xml_file_to_dict(input_file)
        save_dict_to_json(xml_dict, output_json)
        print(f"Processed {filename}")

```

### Inserção na Base de Dados
Com o dataset já pronto, o ficheiro `output.json` é inserido na path `prisma/` e apartir de outro script (seed.js) é inserido na base de dados.
Para inserir na base de dados é necessário fazer primeiro um `npx prisma migrate dev` de forma a atualizar a estrutura da base de dados pelo `schema.prisma`.

### Novas ruas
Para posteriormente implementar a submissão de novas ruas foi feito um script que automatiza todo este processo.
O ficheiro pode ser encontrado na pasta do projeto pelo nome de `processZip.py`. Este recebe somente o path para o arquivo e irá fazer as operações necessárias para inserir os dados no sistema.

## Import e Export
O desenvolvimento dos scripts `export.sh` e `import.sh` foi essencial pois foram criados para exportar e importar bases de dados PostgreSQL em execução num container Docker

### export.sh

#### Propósito

O script export.sh tem como objetivo exportar os dados de tabelas específicas da base de dados PostgreSQL para arquivos SQL.

#### Estrutura do Script
##### Verificação do Container

```bash

if ! docker ps -f name=eng_web_g41-postgres --format '{{.Names}}' | grep -q "eng_web_g41-postgres"; then
  echo "O container Docker 'eng_web_g41-postgres' não está em execução. Inicie a base de dados com './start-database.sh' antes de exportar os dados."
  exit 1
fi
```

Este código verifica se o container Docker eng_web_g41-postgres está em execução. Caso contrário, o script exibe uma mensagem de erro e termina a execução.

##### Criação da pasta de Saída

```bash

output_dir="exported_data"
mkdir -p "$output_dir"
```

Define a pasta de saída (exported_data) e cria-a, se ainda não existir.

##### Função de Exportação

```bash

export_table() {
    table_name="$1"
    output_file="$output_dir/$table_name.sql"
    echo "A exportar tabela $table_name para $output_file ..."
    docker exec -t eng_web_g41-postgres psql -U postgres -d eng_web_g41 -c "COPY public.\"$table_name\" TO '/tmp/$table_name.sql';"
    docker cp eng_web_g41-postgres:/tmp/"$table_name.sql" "$output_file"
    docker exec -t eng_web_g41-postgres rm "/tmp/$table_name.sql"
}
```

A função export_table exporta uma tabela específica da base de dados para um arquivo SQL:

- Executa o comando COPY dentro do container para copiar os dados da tabela para um arquivo temporário
- Copia o arquivo temporário do container para a pasta de saída no host
- Remove o arquivo temporário do container

##### Listagem de Tabelas e Exportação

```bash

echo "Listando todas as tabelas na base de dados:"
docker exec -t eng_web_g41-postgres psql -U postgres -d eng_web_g41 -c "\dt"

tables=(
    "Post"
    "Account"
    "Session"
    "User"
    "Comment"
    "Like"
    "VerificationToken"
    "Rua"
    "Figura"
    "Casa"
)

for table in "${tables[@]}"; do
    export_table "$table"
done

echo "Exportação concluída. Os arquivos SQL estão em '$output_dir'."
```
- Lista todas as tabelas da base de dados.
- Define um array com os nomes das tabelas a serem exportadas.
- Itera sobre cada tabela, chamando a função export_table para exportar os dados.

### import.sh
#### Propósito

O script import.sh tem como objetivo importar os dados de arquivos SQL para tabelas específicas de um banco de dados PostgreSQL.

#### Estrutura do Script
##### Verificação do Container

```bash

if ! docker ps -f name=eng_web_g41-postgres --format '{{.Names}}' | grep -q "eng_web_g41-postgres"; then
  echo "O container Docker 'eng_web_g41-postgres' não está em execução. Inicie a base de dados com './start-database.sh' antes de importar os dados."
  exit 1
fi
```

Verifica se o container Docker eng_web_g41-postgres está em execução. Caso contrário, o script exibe uma mensagem de erro e termina a execução.

##### Criação do Diretório de Saída

```bash

output_dir="exported_data"
mkdir -p "$output_dir"
```

Define o diretório de saída (exported_data) e cria-o, se ainda não existir.

##### Função de Importação

```bash

import_table() {
    table_name="$1"
    input_file="$output_dir/$table_name.sql"
    if [ -f "$input_file" ]; then
        echo "A importar tabela $table_name do arquivo $input_file ..."
        docker cp "$input_file" eng_web_g41-postgres:/tmp/"$table_name.sql"
        docker exec -t eng_web_g41-postgres psql -U postgres -d eng_web_g41 -c "COPY public.\"$table_name\" FROM '/tmp/$table_name.sql';"
        docker exec -t eng_web_g41-postgres rm "/tmp/$table_name.sql"
    else
        echo "Arquivo $input_file não encontrado. Ignorar importação para a tabela $table_name."
    fi
}
```
A função import_table importa dados de um arquivo SQL para uma tabela específica da base de dados:

- Verifica se o arquivo SQL existe.
- Copia o arquivo SQL para um diretório temporário dentro do container.
- Executa o comando COPY dentro do container para importar os dados do arquivo para a tabela.
- Remove o arquivo temporário do container.

##### Listagem de Tabelas e Importação

```bash

echo "A listar todas as tabelas da base de dados:"
docker exec -t eng_web_g41-postgres psql -U postgres -d eng_web_g41 -c "\dt"

tables=(
    "Post"
    "Account"
    "Session"
    "User"
    "Comment"
    "Like"
    "VerificationToken"
    "Rua"
    "Figura"
    "Casa"
)

for table in "${tables[@]}"; do
    import_table "$table"
done

echo "Importação concluída. Os arquivos SQL da diretoria '$output_dir' importados com sucesso."
```
- Lista todas as tabelas da base de dados.
- Define um array com os nomes das tabelas a serem importadas.
- Itera sobre cada tabela, chamando a função import_table para importar os dados.

# Funcionalidades
A aplicação tem como funcionalidades a listagem, pesquisa, filtragem e ordenação de todas as ruas disponibilizadas no dataset, e de todas as freguesias também. Tudo de forma clara e intuitiva ao utilizador. Permite entrar numa determinada rua e ver detalhes sobre a mesma. É também possível editar qualquer detalhe se o user tiver a permição para tal. É possível também criar um post sobre uma determinada rua, nesse post poderá ser escrito um texto e submetido para que todos os outros users o possam visualizar, comentar e gostar (like). Na página Posts é possível ordenar os posts de acordo com a data na qual foram criados ou de acordo com a popularidade (quantidade de likes), cada post contém um redirecionamento rápido para a página da respetiva rua. É também possível visitar a página Perfil (em caso de autenticação) lá são disponibilizados os dados de registo do user e todos os posts da sua autoria.
É possível a um user autenticar-se, seja efetuando um registo ou um login (caso já esteja registado). A autenticação garante o nível de acesso base "user". Para adicionar um admin é necessário alterar as permissões manualmente na base de dados. 

A aplicação criada permite a coexistência de três níveis de acesso em termos de utilizadores, um administrador (que consegue fazer tudo), um utilizador não autenticado consegue visualizar toda a informações relativa a todas as ruas, freguesia mas não consegue interagir com nada, nem ver os posts. Já um user autenticado para além de visualizar tudo consegue criar posts, comentá-los, dar like e visitar a página do seu perfil. Um admin para além das funcionalidades todas dos outros dois níveis, consegue adicionar uma rua, editar e apagar registos de ruas.

# Ferramentas Utilizadas
## T3 Stack

A T3 stack é composta por várias ferramentas essenciais para o desenvolvimento de aplicações web modernas. As principais ferramentas utilizadas foram:

- Next.js: Uma framework baseada em React que permite criar aplicações web otimizadas e escaláveis, com funcionalidades de rendering no lado do servidor (SSR) e geração estática de páginas (SSG).
- TypeScript: Uma linguagem de programação que adiciona tipagem estática ao JavaScript, proporcionando uma maior segurança e robustez ao código, além de facilitar a deteção de erros durante o desenvolvimento.
- Tailwind CSS: Uma framework de CSS utilitária que permite a criação de interfaces de utilizador altamente customizáveis e responsivas através de classes predefinidas, agilizando o processo de estilização.
- tRPC: Uma biblioteca que facilita a criação de APIs seguras e eficientes em TypeScript, permitindo-nos definir métodos de forma tipada e comunicar diretamente entre o frontend e o backend sem a necessidade de definir REST APIs convencionais.
- Prisma: Um ORM (Object-Relational Mapping) que simplifica a interação com a base de dados, permitindo a definição de modelos de dados e a execução de queries de maneira intuitiva e eficiente.

# Processo de Desenvolvimento
## 1. Configuração do Projeto

Iniciámos o projeto criando um novo repositório Git para gerir as versões do código e instalar todas as dependências necessárias para a stack que vamos usar. Utilizámos o comando `npx create-t3-app` para gerar a estrutura inicial do projeto, o que nos forneceu uma base sólida para começar o desenvolvimento.

## 2. Configuração do Prisma

A configuração do Prisma foi um passo crucial para a gerir a base de dados. Criámos o ficheiro `schema.prisma` para definir os esquemas dos diferentes objetos que seriam armazenados na base de dados. Este ficheiro permite a definição de modelos de dados de forma clara e estruturada, facilitando a criação e gestão das diferentes tabelas necessárias.

## 3. Desenvolvimento do Backend com tRPC

Implementámos os endpoints do backend utilizando o tRPC, que permite a criação de APIs tipadas e eficientes. A diretoria src/server/api/routers/ contém os diferentes routers que agrupam os métodos criados para obter, criar e interagir com os diferentes modelos da base de dados. A utilização do tRPC simplificou a comunicação entre o frontend e o backend, permitindo a execução de chamadas de métodos de forma direta e tipada.

## 4. Criação dos Componentes com Next.js e Tailwind CSS

De seguida, desenvolvemos os diversos componentes e páginas da interface do utilizador utilizando React em conjunto com Tailwind CSS. Alguns dos componentes principais incluem a Navbar, a RuaCard, e o PostCard. A utilização do Tailwind CSS facilitou a criação de interfaces responsivas e estilizadas, enquanto o Next.js proporcionou uma estrutura robusta para a organização das páginas e componentes.

O tRPC permitiu-nos aceder facilmente aos métodos e funções definidos no servidor a partir do lado do cliente, facilitando a integração e comunicação entre as diferentes partes da aplicação.

# Conclusão

O desenvolvimento desta aplicação utilizando a T3 stack proporcionou uma experiência robusta e eficiente, combinando a potência do Next.js, a flexibilidade do Tailwind CSS, a segurança do TypeScript e a eficiência do tRPC e do Prisma para gerir e interagir com a base de dados. Os desafios enfrentados, como a implementação de componentes reativos e responsivos, foram superados com sucesso, resultando numa aplicação funcional e que cumpre com a grande maioria dos requisitos.

# Trabalho futuro

Para o futuro, existem várias áreas onde podemos continuar a melhorar e expandir a aplicação:

1. Melhoria da Experiência do Utilizador (UX): Continuar a otimizar a interface do utilizador para garantir uma experiência mais intuitiva e agradável.
2. Funcionalidades Adicionais: Implementar novas funcionalidades, como notificações em tempo real, logins a partir de outras plataformas, e algumas funcionalidades que planeamos implementar mas que não foi possível.
3. Escalabilidade e Performance: Trabalhar na otimização da performance da aplicação e na sua capacidade de escalar para suportar um número crescente de utilizadores.
4. Testes e Qualidade: Aumentar a cobertura de testes automatizados para garantir a qualidade e estabilidade do código à medida que a aplicação cresce.

Este relatório proporciona uma visão detalhada do desenvolvimento da aplicação, destacando as ferramentas e processos utilizados, bem como os desafios enfrentados e as soluções implementadas. A aplicação desenvolvida com a T3 stack demonstra a eficácia desta combinação de tecnologias modernas para o desenvolvimento de aplicações web robustas e escaláveis.