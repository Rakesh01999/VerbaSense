import zipfile
import xml.etree.ElementTree as ET

with zipfile.ZipFile('e:/Internship/VerbaSense/Web_Application_Development_Requirement.docx') as z:
    text = ''.join(str(node.text) for node in ET.fromstring(z.read('word/document.xml')).iter() if node.text)
    with open('e:/Internship/VerbaSense/reqs.txt', 'w', encoding='utf-8') as f:
        f.write(text)
