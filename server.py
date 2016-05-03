import os
import sys
from bs4 import BeautifulSoup
from flask import Flask, render_template, make_response, request, jsonify
from tts import RecaiusTTS

BASE_DIR = os.path.dirname(__file__)

app = Flask(__name__)

# use heroku environmental variable
rec = RecaiusTTS(os.environ['TTS_ID'],
                 os.environ['TTS_PASSWORD'])


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/get_speaker_list', methods=['POST'])
def get_speaker_list():
    speakers = []

    response = rec.get_speaker_list()
    soup = BeautifulSoup(response, 'lxml')
    for alias in soup.find_all('alias'):
        lang, name = alias.contents[0].split(',')[0].split(':')
        speakers.append((name, lang))

    return jsonify(speakers)


@app.route('/synthesize', methods=['POST'])
def synthesize():
    # get POST arguments
    text = request.form.get('text', None)
    speaker = request.form.get('speaker', None)

    print(text, file=sys.stderr)
    print(speaker, file=sys.stderr)

    # get synthesized wave data from web api
    rec.speaker(speaker)
    wave_data = rec.get_wav(text)

    # return wave data
    response = make_response(wave_data)
    response.headers['Content-Type'] = 'audio/wav'

    return response


if __name__ == '__main__':
    app.run()
