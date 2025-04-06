import numpy as np
import matplotlib.pyplot as plt
import base64
import urllib.request
from flask import Flask, render_template, request, jsonify
from autotrace import Bitmap, VectorFormat
from PIL import Image
from io import BytesIO

# Create a Flask app instance
app = Flask(__name__)

# Routes
@app.route('/')
def main():
    return render_template('main.html')

@app.route('/dragDrop')
def dragDrop():
    return render_template('dragDrop.html')

@app.route('/pngToSvg', methods=['POST'])  # Change to POST method
def execute():
    data = request.get_json()  # Get the JSON data from the body of the request

    # print(data['pngData'])  # Print the data to see the received input

    result = pngToSvg(data['pngData'])
    
    # You can process the data here and return a response
    return jsonify({"message": "SVG obtained successfully", "svg_info": result})

def pngToSvg(data):
    image_data = data.split(",")[1]  # This gets only the base64 part

    # print(image_data)

    # Decode the base64 string
    image_bytes = base64.b64decode(image_data)

    # Convert the byte data to an image
    image = np.asarray(Image.open(BytesIO(image_bytes)).convert("RGB"))

    # Create a bitmap.
    bitmap = Bitmap(image)

    # Trace the bitmap.
    vector = bitmap.trace()

    # vector.save("temp.svg")

    # Get an SVG as a byte string.
    svg = vector.encode(VectorFormat.SVG)

    # print(svg)

    # print(svg.decode('utf-8'))

    return svg.decode('utf-8')

# Run the app
if __name__ == '__main__':
    app.run(debug=True)
    # app.run(debug=False)

