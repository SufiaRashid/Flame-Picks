#main file which runs the app

from api import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug = True)