import json

file = open("mapa-virtual.json", "r")
data = json.load(file)
file.close()


class Cidade:
    def __init__(self, id:str, nome:str, populacao:str, descricao:str, distrito:str):
        self.id = id
        self.nome = nome
        self.populacao = populacao
        self.descricao = descricao
        self.distrito = distrito
        
class Ligacao:
    def __init__(self, id:str, cidade1:Cidade, cidade2:Cidade, distancia:float):
        self.id = id
        self.cidade1 = cidade1
        self.cidade2 = cidade2
        self.distancia = distancia
        
        
        
cidades = []
ligacoes = []


def getCidadeByID(id:str) -> Cidade:
    return next((cidade for cidade in cidades if cidade.id == id))

for c in data['cidades']:
    cidades.append(Cidade(c['id'], c['nome'], c['população'], c['descrição'], c['distrito']))

for l in data['ligacoes']:
    ligacoes.append(Ligacao(l['id'], l['origem'], l['destino'], l['distância']))


for cidade in cidades:
    outFile = open("cidades/" + cidade.id + ".html", "w")
    outHTML = f"""
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>Cidade: {cidade.nome}</title>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
	</head>

    <body>
        <h3 style="padding: 20px; font-size:40px; display: flex; justify-content: space-between;">
            <span>{cidade.nome}</span>
            <a href="http://localhost:12345/" style="text-align: right;">Back</a>
        </h3>
        <div class="w3-container">
            <header class="w3-container w3-amber">
                <h3>Informações</h3>
            </header>
            <div class="w3-container">
                <p>Nome: {cidade.nome}</p>
                <p>Distrito: {cidade.distrito}</p>
                <p>Descrição: {cidade.descricao}</p>
                <p>População: {cidade.populacao}</p>
            </div>
        </div>
        <div class="w3-container w3-padding">
            <header class="w3-container w3-amber">
                <h3>Ligações</h3>
            </header>
            <div class="w3-container">
                <table class="w3-table">
                    <tr>
                        <th>Cidade (Distrito)</th>
                        <th>Distância (km)</th>
                    </tr>
"""
    for ligacao in ligacoes:
        if ligacao.cidade1 == cidade.id:
            cidadeDest= getCidadeByID(ligacao.cidade2)
            outHTML += f"""
                    <tr>
                        <td class="w3-hover-amber"><a href="http://localhost:12345/{ligacao.cidade2}">{cidadeDest.nome} ({cidadeDest.distrito})</a></td>
                        <td>{ligacao.distancia}</td>
                    </tr>
"""

    outHTML += f"""
                </table>
            </div>
        </div>
        <footer class="w3-container w3-amber">
            <h5>EngWeb2024 Aluno A100701</h5>
            <address>
                <a href="http://localhost:12345/">Back</a>
            </address>
        </footer>
	</body>
</html>
"""
    outFile.write(outHTML)
    outFile.close()
    
    
indexHTML = f"""

<!DOCTYPE html>
<html lang="en">
	<head>
		<title>Mapa Virtual</title>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
		<title>Mapa Virtual</title>
	</head>
    <body>

        <div class="w3-card-4">

            <header class="w3-container w3-amber">
                <h3>Lista de Cidades</h3>
            </header>

            <div class="w3-container">
                <ul class="w3-ul w3-hoverable">
"""	

for cidade in cidades:
	indexHTML += f"""
					<li class="w3-hover-amber">
						<a href="http://localhost:12345/{cidade.id}">{cidade.nome} ({cidade.distrito})</a>
					</li>
"""

indexHTML += """
				</ul>
			</div>

			<footer class="w3-container w3-amber">
				<h5>EngWeb2024 Aluno A100701</h5>
			</footer>
		</div>
	</body>
</html>
"""

index = open("./cidades/index.html","w");
index.write(indexHTML)
index.close()