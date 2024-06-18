import zipfile
import os
import shutil
import subprocess
import sys
from lxml import etree
import xml.etree.ElementTree as ET
import json
import re

unzip_dir = 'unzipped_files'
xsd_path = 'MRB-rua.xsd'
output_json = 'prisma/output.json'
public_imgs_dir = 'public/imgs'

def unzip_file(zip_path, extract_to):
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_to)
    print(f"Descompactado {zip_path} para {extract_to}")

def validate_xml(xsd_schema, xml_path):
    with open(xml_path, 'rb') as xml_file:
        xml_doc = etree.XML(xml_file.read())
        if xsd_schema.validate(xml_doc):
            print(f"{xml_path} é válido.")
            return True
        else:
            print(f"{xml_path} é inválido!")
            log = xsd_schema.error_log
            print(log)
            return False

def transformar_compostos(texto):
    resultado = texto[0]
    for i in range(1, len(texto)):
        if texto[i].isupper():
            resultado += ' ' + texto[i]
        else:
            resultado += texto[i]
    return resultado

def addImagemAtual(figuras, input_file, atual_dir):
    nome_arquivo_base = os.path.splitext(os.path.basename(input_file))[0].split('-')[-1]
    numero_arquivo_base_xml = os.path.splitext(os.path.basename(input_file))[0].split('-')[1]
    numero_arquivo_base_imagens = str(int(numero_arquivo_base_xml))

    padrao_numero_imagem_1 = re.compile(r'{}-.*?-Vista\d+\.(jpg|jpeg|png|gif)'.format(re.escape(numero_arquivo_base_xml)), re.IGNORECASE)
    padrao_numero_imagem_2 = re.compile(r'{}-.*?-Vista\d+\.(jpg|jpeg|png|gif)'.format(re.escape(numero_arquivo_base_imagens)), re.IGNORECASE)

    arquivos_atual = os.listdir(atual_dir)

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
    text = []
    if element.text:
        text.append(element.text.strip())
    for sub_element in element:
        text.append(extract_text(sub_element))
        if sub_element.tail:
            text.append(sub_element.tail.strip())
    return ' '.join(text).strip()

def process_xml_file_to_dict(input_file, atual_dir):
    tree = ET.parse(input_file)
    root = tree.getroot()

    result = {}

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

    corpo = root.find('corpo')
    if corpo is not None:
        figuras = []
        descricao = []
        casas = []

        addImagemAtual(figuras, input_file, atual_dir)
        for child in corpo:
            if child.tag == 'para':
                descricao.append(extract_text(child))
            elif child.tag == 'figura':
                figura = {
                    "nome": child.get('id'),
                    "path": os.path.join("imgs", child.find('imagem').get('path').split('/')[-1]) if child.find('imagem') is not None else '',
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

def copy_images(src_dir, dest_dir):
    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir)
    for file_name in os.listdir(src_dir):
        full_file_name = os.path.join(src_dir, file_name)
        if os.path.isfile(full_file_name):
            shutil.copy(full_file_name, dest_dir)
    print(f"Imagens copiadas de {src_dir} para {dest_dir}")

def main():
    unzip_file(sys.argv[1], unzip_dir)

    with open(xsd_path, 'rb') as xsd_file:
        xsd_doc = etree.XML(xsd_file.read())
        xsd_schema = etree.XMLSchema(xsd_doc)

    texto_dir = os.path.join(unzip_dir, 'texto')
    for xml_file in os.listdir(texto_dir):
        if xml_file.endswith('.xml'):
            xml_path = os.path.join(texto_dir, xml_file)
            if not validate_xml(xsd_schema, xml_path):
                shutil.rmtree(unzip_dir)
                print(f"Pasta {unzip_dir} removida.")
                sys.exit(1)

    for filename in sorted(os.listdir(texto_dir)):
        if filename.endswith('.xml'):
            input_file = os.path.join(texto_dir, filename)
            xml_dict = process_xml_file_to_dict(input_file, os.path.join(unzip_dir, 'atual'))
            save_dict_to_json(xml_dict, output_json)
            print(f"Processado {filename}")

    copy_images(os.path.join(unzip_dir, 'imagem'), public_imgs_dir)
    copy_images(os.path.join(unzip_dir, 'atual'), public_imgs_dir)

    try:
        subprocess.run(['node', 'prisma/seed.js'], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Erro ao executar o script seed.js: {e}")
        shutil.rmtree(unzip_dir)
        print(f"Pasta {unzip_dir} removida.")
        sys.exit(1)

    shutil.rmtree(unzip_dir)
    print(f"Pasta {unzip_dir} removida.")

if __name__ == "__main__":
    main()
