import xml.etree.ElementTree as ET 
import os

file_path = "./dataset/texto/"
ruas = []

ruasHTML = ""
directory = os.fsencode(file_path)

for file in os.listdir(directory):
    filename = os.fsdecode(file)
    
    rua = ET.parse(file_path + filename).getroot()
    meta = rua.find("./meta")
    nome = meta.find("./nome").text.strip()
    numero = int(meta.find("./número").text)
    ruas.append((nome,numero))
    
ruas.sort(key = lambda x: x[1])

for (nome,numero) in ruas:
	ruasHTML += f"""
		<li>
			<a href="rua{numero}.html">{nome}</a>
		</li>
	"""
 
paginaHTML = """
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>Lista Ruas</title>
		<meta charset="UTF-8">
		<link rel="stylesheet" href="w3.css">
	</head>

	<body>
		<div class="w3-card-4">
			<header class="w3-container w3-green">
				<h3>Lista de Ruas</h3>
			</header>

			<div class="w3-container">
				<ul class="w3-ul w3-card-4" style="width:50%">
"""	+ ruasHTML + """
				</ul>
			</div>
		</div>
	</body>
</html>
"""

out = open("./ruas/index.html", "w")
out.write(paginaHTML)
out.close()