#!/usr/bin/env bash

# Verifica se o container Docker está em execução
if ! docker ps -f name=eng_web_g41-postgres --format '{{.Names}}' | grep -q "eng_web_g41-postgres"; then
  echo "O container Docker 'eng_web_g41-postgres' não está em execução. Inicie o banco de dados com './start-database.sh' antes de exportar os dados."
  exit 1
fi

output_dir="exported_data"

mkdir -p "$output_dir"

# Função para exportar dados de uma tabela para um arquivo SQL
export_table() {
    table_name="$1"
    output_file="$output_dir/$table_name.sql"
    echo "A exportar tabela $table_name para $output_file ..."
    docker exec -t eng_web_g41-postgres psql -U postgres -d eng_web_g41 -c "COPY public.\"$table_name\" TO '/tmp/$table_name.sql';"
    docker cp eng_web_g41-postgres:/tmp/"$table_name.sql" "$output_file"
    docker exec -t eng_web_g41-postgres rm "/tmp/$table_name.sql"
}

# Listar todas as tabelas no base de dados
echo "Listando todas as tabelas no banco de dados:"
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

