import numpy as np
import matplotlib.pyplot as plt
import base64
import urllib.request
import string
import random
import requests
import time
import os
from flask import Flask, render_template, request, jsonify
from autotrace import Bitmap, VectorFormat
from PIL import Image
from io import BytesIO
# from wand.image import Image as WandImage
from image_upscaling_api import upload_image, get_uploaded_images

# Create a Flask app instance
app = Flask(__name__)

# Route to open the main html page with / at the end of the localhost url
@app.route('/')
def main():
    return render_template('main.html')

# Route to open the dragDrop html page with /dragDrop at the end of the localhost url
@app.route('/dragDrop')
def dragDrop():
    return render_template('dragDrop.html')

# API Endpoint for converting png to svg
@app.route('/pngToSvg', methods=['POST']) 
def execute():
    # Get the JSON data from the body of the request
    data = request.get_json()  

    # print(data['pngData'])

    # Call the pngToSvg() function below with the passed data['pngData'] as the parameter
    result = pngToSvg(data['pngData'])
    
    return jsonify({"message": "SVG obtained successfully", "svg_info": result})

# API Endpoint for upscaling the image
@app.route('/pngUpscale', methods=['POST'])
def upscale():
    # Get the JSON data from the body of the request
    data = request.get_json()  

    # print(data['pngData'])

    # Call the pngUpscale() function below with the passed data['pngData'] as the parameter
    result = pngUpscale(data['pngData'])
    
    return jsonify({"message": "PNG Upscaled successfully", "upscaled_path": result})

def pngUpscale(data):
    # The resulting images will be saved in static/images/
    static_folder = os.path.join(app.root_path, 'static', 'images')

    # Ensure the directory exists
    os.makedirs(static_folder, exist_ok=True)

    # Generate a random 32-digit hexadecimal string
    # This is used as a unique identifier of the image, as per the 
    # image_upscaling_api documentation
    hex_string = ''.join(random.choices(string.hexdigits.lower(), k=32))

    # This gets only the base64 part
    image_data = data.split(",")[1]

    # Decode the base64 string
    image_bytes = base64.b64decode(image_data)

    # Convert the byte data to an image
    image = np.asarray(Image.open(BytesIO(image_bytes)).convert("RGB"))

    # Convert the numpy array back to a PIL Image
    pil_image = Image.fromarray(image)

    # Save the image as PNG locally
    # Define the full path to save the image
    image_path = os.path.join(static_folder, 'saved_image.png')
    # Save the image
    pil_image.save(image_path, 'PNG')
    
    # Upload the image via image_upscaling_api
    # Note that image_path is the local path to the saved png image
    upload_image(image_path, hex_string, 
            use_face_enhance=False,
			scale = 2)

    # After upscaling, the image will be saved in the completed variable
    waiting, completed, in_progress = get_uploaded_images(hex_string)

    # Wait until the image is upscaled
    while not completed:
        # Sleep for 2 seconds before checking again, this is adjustable
        time.sleep(2)  
        # Check for completion again
        waiting, completed, in_progress = get_uploaded_images(hex_string)

    # Make a request for the upscaled image stored in completed[0]
    response = requests.get(completed[0])

    if response.status_code == 200:
        # If it worked:

        # Open the upscaled image and store it in the image variable
        image = Image.open(BytesIO(response.content))
        
        # Store the upscaled image in static/images/
        image_path = os.path.join(static_folder, 'upscaled_image.png')
        image.save(image_path, 'PNG')

        # print("Image upscaled and downloaded as a png")
        # return completed[0]

        return image_path
    else:
        return None

def pngToSvg(data):
    # The data parameter passes the base64 url string

    # This gets only the base64 part
    image_data = data.split(",")[1]  

    # print(image_data)

    # Decode the base64 string
    image_bytes = base64.b64decode(image_data)

    # Convert the byte data to an image
    image = np.asarray(Image.open(BytesIO(image_bytes)).convert("RGB"))

    # Testing the following:
    # Convert the NumPy array back into a Pillow Image object
#     pil_image = Image.fromarray(image)
# 
#     with WandImage.from_array(np.array(pil_image)) as wand_img:
#         # Apply thresholding with a value of 0.5 (This is just an example threshold value)
#         wand_img.threshold(0.5)  # This applies a threshold to create a high-contrast binary image
#         # Optionally, save the resulting image
#         wand_img.save(filename='thresholded_output.png')
# 
#         print("Thresholding applied and image saved as 'thresholded_output.png'.")

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
    # Here you can toggle between debugging or not
    app.run(debug=True)
    # app.run(debug=False)