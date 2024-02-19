import os
import glob
import xml.etree.ElementTree as ET
import xmlschema

def extract_number(num_str: str) -> int:
    return int(num_str)

def process_name(name_str: str) -> str:
    return name_str.strip()

def parse_file(file_path: str, schema):
    try:
        tree = ET.parse(file_path)
        return tree.getroot()
    except ET.ParseError as e:
        print(f"Error parsing {file_path}: {e.msg}")
        return None
    
    
def create_html_header(meta_elem):
    number = extract_number(meta_elem.find("número").text)
    name = process_name(meta_elem.find("nome").text)
    html = f"""<!DOCTYPE html>
<html lang="en">
    <head>
        <title>{number}. {name}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="w3.css">
    </head>

    <body>
        <div class="w3-container">
            <address>
                <a href="index.html">Voltar</a>
            </address>
        </div>
        <div class="w3-card-4">

            <header class="w3-container w3-green">
                <h3>{number}. {name}</h3>
            </header>
            
            <div class="w3-container">
    """    
    return html


def create_paragraph_html(elem, with_tag: bool):
    html = """            <div class="w3-container">"""
    if with_tag:
        html += "            <h4>"
    html += "".join(elem.itertext())
    if with_tag:
        html += "</h3>"
    html += """</div>
    """
    return html


def create_houses_list_html(elem):
    html = """
            <h4><b>Lista de casas</b></h4>
            <div class="w3-container">
                <table class="w3-table-all">
                    <tr>
                        <th>Nº casa</th>
                        <th>Enfiteuta</th>
                        <th>Foro</th>
                        <th>Descrição</th>
                        <th>Vista</th>
                    </tr>"""
    for house_elem in elem.findall("casa"):
        number = house_elem.find("número").text
        enfiteuta = house_elem.find("enfiteuta").text if house_elem.find("enfiteuta") is not None else "-"
        rent = house_elem.find("foro").text if house_elem.find("foro") is not None else "-"
        
        desc_text = "-"
        desc = house_elem.find("desc")
        if desc is not None:
            desc_text = "".join(create_paragraph_html(para_elem, False) for para_elem in desc.findall("para"))

        view = house_elem.find("vista").text if house_elem.find("vista") is not None else "-"

        html += f"""
                    <tr>
                        <td>{number}</td>
                        <td>{enfiteuta}</td>
                        <td>{rent}</td>
                        <td>{desc_text}</td>
                        <td>{view}</td>
                    </tr>"""
        
    html += """
                </table>
            </div>
    """
    return html


def create_figure_html(elem, fig_count: int, fig: int):
    numero_element = str(fig)
    if numero_element is not None:
        current_photos = glob.glob("./dataset/atual/" + numero_element + "-*.JPG");
    else:
        print("?????????????????????????????????")
        current_photos = []

    html = f"""
            <div class="w3-container">
                <div class="w3-container" style="display: flex; flex-direction: row; flex-wrap: wrap; justify-content: center">
                    <div class="w3-center image-div">
                        <img src={"../dataset/" + elem.find("imagem").attrib["path"][3:]} alt="foto não existe?" style="object-fit: cover; width:auto; max-height: 700px; max-width: 100%">
                        <div class="w3-container">
                            <p>{elem.find("legenda").text}</p>
                        </div>
                    </div>
    """
    if (fig_count + 1) <= len(current_photos):
        photo_path = current_photos[fig_count]
        html += f"""     
                    <div class="w3-center image-div">   
                        <img src={"." + photo_path} alt="foto não carregou" style="object-fit: cover; width:auto; max-height: 700px; max-width: 100%">
                        <div class="w3-container">
                            <p>{elem.find("legenda").text + " (atualmente)"}</p>
                        </div>
                    </div>
        """
    html += "\n      </div></div>"
    return html


def create_name_html(elem):
    html = f"""
        <h4>
            <b>{elem.text}</b>
        </h4>
    """
    return html



def create_html_footer():
    footer = """
            </div>
		</div>
	</body>
</html>
"""
    return footer


def process_street_files(file_directory, xsd_schema):
    for file in os.listdir(file_directory):
        filename = os.fsdecode(file)
        street = parse_file(os.path.join(file_directory, filename), xsd_schema)

        content_html = ""
        if street is None:
            print(f"Error parsing file: {filename}")
            continue

        meta = street.find("./meta")
        if meta is None:
            print(f"Couldn't find meta tag in file: {filename}")
            continue

        fig_count = 0
        content_html += create_html_header(meta)
        for elem in street.findall("./corpo/*"):
            match elem.tag:
                case "para":
                    content_html +=  create_paragraph_html(elem, True)
                case "lista-casas":
                    content_html += create_houses_list_html(elem)
                case "figura":
                    content_html +=  create_figure_html(elem, fig_count, extract_number(meta.find('número').text))
                    fig_count += 1
                case "nome":
                    content_html += create_name_html(elem)

        output_file = open(f"./ruas/rua{extract_number(meta.find('número').text)}.html", "w")
        output_file.write(content_html + create_html_footer())
        output_file.close()

file_path = "./dataset/texto/"
xsd_schema = xmlschema.XMLSchema("./dataset/MRB-rua.xsd")
process_street_files(file_path, xsd_schema)