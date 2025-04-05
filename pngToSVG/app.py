from flask import Flask, render_template

# Create a Flask app instance
app = Flask(__name__)

# Routes
@app.route('/')
def main():
    return render_template('main.html')

@app.route('/dragDrop')
def dragDrop():
    return render_template('dragDrop.html')

# @app.route('/about')
# def about():
#     return 'This is the About page.'

# Run the app
if __name__ == '__main__':
    # app.run(debug=True)
    app.run(debug=False)

