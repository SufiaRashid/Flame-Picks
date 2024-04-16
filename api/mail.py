from flask import Blueprint, request, jsonify
from . import mail
from flask_mail import Message

mail_bp = Blueprint('mail', __name__)

@mail_bp.route('/send-email', methods=['POST'])
def send_email():
    data = request.get_json()
    subject = "Support Email"
    recipient = "FlamePicksHelp@gmail.com"
    body = f"From: {data['email']}\nMessage: {data['message']}"

    msg = Message(subject, sender='FlamePicksHelp@gmail.com', recipients=[recipient])
    msg.body = body
    mail.send(msg)
    return jsonify({'message': 'Email sent successfully'}), 200