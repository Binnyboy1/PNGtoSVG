from flask import Flask, render_template, request
import numpy as np
from autotrace import Bitmap, VectorFormat
from PIL import Image
import matplotlib.pyplot as plt

# Create a Flask app instance
app = Flask(__name__)

# Routes
@app.route('/')
def index():
    return render_template('dragDrop.html')  # This will render the 'index.html' file in the 'templates' folder

# Work in progress. Check whether passing parameters works. What to return??
@app.route('/pngToSvg', methods=['POST'])
def execute():
    if request.method == 'POST':
        # Capture the two string parameters from the form
        pngName = request.form['param1']
        svgName = request.form['param2']

        pngToSvg(pngName, svgName)  
        # return render_template('index.html', message="Image processed successfully!")

def pngToSvg(pngName, svgName):
    # Load an image.
    image = np.asarray(Image.open(f"{pngName}.png").convert("RGB"))

    # Create a bitmap.
    bitmap = Bitmap(image)

    # Trace the bitmap.
    vector = bitmap.trace()

    # Save the vector as an SVG.
    vector.save(f"{svgName}.svg")

    # # Get an SVG as a byte string.
    svg = vector.encode(VectorFormat.SVG)

    # print(svg.decode('utf-8'))

    return svg.decode('utf-8')

# Run the app
if __name__ == '__main__':
    # app.run(debug=True)
    app.run(debug=False)

