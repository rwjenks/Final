from flask import Flask, request, render_template
# set the project root directory as the static folder, you can set others.
app = Flask(__name__, static_url_path='')

@app.route('/')
def index():
   return render_template('/html.html')

@app.route('/aboutus')
def aboutus():
   return render_template('/aboutus.html')

@app.route('/alluvial')
def static_page():
   return render_template('/alluvial.html')

@app.route('/model')
def model():
   return render_template('/model.html')

@app.route('/bestvsworst')
def bvw():
   return render_template('/bestvsworst.html')   

if __name__ == '__main__':
   app.run(debug=True)