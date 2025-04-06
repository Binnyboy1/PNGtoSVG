import numpy as np
import matplotlib.pyplot as plt
import base64
import urllib.request
import string
import random
import requests
import time
from flask import Flask, render_template, request, jsonify
from autotrace import Bitmap, VectorFormat
from PIL import Image
from io import BytesIO
from wand.image import Image as WandImage
from image_upscaling_api import upload_image, get_uploaded_images

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

@app.route('/pngUpscale', methods=['POST'])
def execute():
    data = request.get_json()  # Get the JSON data from the body of the request

    result = pngUpscale(data)
    
    # You can process the data here and return a response
    return jsonify({"message": "PNG Upscaled successfully", "upscaled_link": result})

def pngUpscale(data):
    # Generate a random 32-digit hexadecimal string
    hex_string = ''.join(random.choices(string.hexdigits.lower(), k=32))

    image_data = data.split(",")[1]

    # Decode the base64 string
    image_bytes = base64.b64decode(image_data)

    # Convert the byte data to an image
    image = np.asarray(Image.open(BytesIO(image_bytes)).convert("RGB"))
    
    # TODO: Unsure if this method of uploading image object works
    upload_image(image, hex_string, 
            use_face_enhance=False,
			scale = 2)
    
    waiting, completed, in_progress = get_uploaded_images(hex_string)

    # Wait until the image is completed
    # TODO: Does waiting like this work?
    while not completed:
        # You may want to add a small delay to avoid hammering the server with requests
        time.sleep(2)  # Sleep for 1 second before checking again
        waiting, completed, in_progress = get_uploaded_images(hex_string)

    
    response = requests.get(completed[0])

    # TODO: Does this work?
    if response.status_code == 200:
        image = Image.open(BytesIO(response.content))
        return image
    else:
        return None

def pngToSvg(data):
    image_data = data.split(",")[1]  # This gets only the base64 part

    # print(image_data)

    # Decode the base64 string
    image_bytes = base64.b64decode(image_data)

    # Convert the byte data to an image
    image = np.asarray(Image.open(BytesIO(image_bytes)).convert("RGB"))

    # Convert the NumPy array back into a Pillow Image object
    pil_image = Image.fromarray(image)

    # Testing the following:
#     with WandImage.from_array(np.array(pil_image)) as wand_img:
#         # Apply thresholding with a value of 0.5 (This is just an example threshold value)
#         wand_img.threshold(0.5)  # This applies a threshold to create a high-contrast binary image
#         # Optionally, save the resulting image
#         wand_img.save(filename='thresholded_output.png')
# 
#         print("Thresholding applied and image saved as 'thresholded_output.png'.")

#     # Create a bitmap.
#     bitmap = Bitmap(image)
# 
#     # Trace the bitmap.
#     vector = bitmap.trace()
# 
#     # vector.save("temp.svg")
# 
#     # Get an SVG as a byte string.
#     svg = vector.encode(VectorFormat.SVG)
# 
#     # print(svg)
# 
#     # print(svg.decode('utf-8'))
# 
#     return svg.decode('utf-8')

# Run the app
if __name__ == '__main__':
    app.run(debug=True)
    # app.run(debug=False)

