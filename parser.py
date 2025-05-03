import re
import os

class __Label:
    def __init__(self, dst: str, type: str, data: str):
        self.dst = dst
        self.type = type
        self.data = data

def __findLabels(html: str) -> list[__Label]:
    parsed: list[str] = re.findall("!\{[^}]*\}", html)
    if (len(parsed) == 0):
        return []
    
    parsed = list(set(parsed))
    
    labels: list[__Label] = []
    
    for label in parsed:
        data = label[2:-1].split(':')
        print(data)
        labels.append(__Label(label, data[0], data[1]))
        
    return labels
    

def __getLabelData(label: __Label) -> str:
    if label.type == "js" or label.type == "css":
        return f"{label.type}/{label.data}.{label.type}"
        
    dir = os.fsencode(f"static/{label.type}")
    for file in os.listdir(dir):
        filename = os.fsdecode(file)
        if filename.split('.')[0] == label.data:
            return f"{label.type}/{filename}"

def __getContent(label: __Label) -> str:
    if label.type == "shaders":
        return __getLabelData(label)
    
    return f"{"{"}{"{"} url_for('static', filename='{__getLabelData(label)}') {"}"}{"}"}"

def parseHTML(name: str) -> str:
    html = open(f"templates/{name}").read()
    labels = __findLabels(html)
    for label in labels:
        html = html.replace(label.dst, __getContent(label))
        
    return html