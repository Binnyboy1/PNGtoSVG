from flask import Flask, render_template

# Create a Flask app instance
app = Flask(__name__)

# Routes
@app.route('/')
def index():
    return render_template('index.html')  # This will render the 'index.html' file in the 'templates' folder

# @app.route('/about')
# def about():
#     return 'This is the About page.'

# Run the app
if __name__ == '__main__':
    # app.run(debug=True)
    app.run(debug=False)

