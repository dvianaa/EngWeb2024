#!/usr/bin/env bash

# Verifica se o container Docker está em execução
if ! docker ps -f name=eng_web_g41-postgres --format '{{.Names}}' | grep -q "eng_web_g41-postgres"; then
  echo "O container Docker 'eng_web_g41-postgres' não está em execução. Inicie a base de dados com './start-database.sh' antes de importar os dados."
  exit 1
fi

output_dir="exported_data"

mkdir -p "$output_dir"

# Função para importar dados de um arquivo SQL para uma tabela
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

# Listar todas as tabelas da base de dados
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

