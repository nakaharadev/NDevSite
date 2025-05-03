from flask import Flask, render_template_string
from parser import parseHTML
import os

app = Flask(__name__)

@app.route("/")
def index():
    return render_template_string(parseHTML("index.html"))

def main():
    app.run("0.0.0.0", 4040)

if __name__ == "__main__": main()