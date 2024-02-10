# Start Flask app
export FLASK_APP=api
export FLASK_ENV=development
flask run &
# Start React app
cd client && npm start &
wait
