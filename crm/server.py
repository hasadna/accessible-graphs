import wakkaide.network_file
wakkaide.network_file.setup()
from flask import Flask
import os
import mimetypes
mimetypes.init()

# This is an example of a basic Flask server.
# Feel free to try it for yourself 😀!

app = Flask(__name__)

@app.route('/', defaults={'path': ''})
@app.route("/<path:path>")
def get_file(path):
  try:
    path = get_path_in_public(path)
    f = open(path, "rb" if is_binary(path) else "r")
    return f.read(), 200, {'Content-Type': get_mime(path)}

  except FileNotFoundError:
    error_message = 'FileNotFoundError: No such file: ' + path
    print(error_message)
    return error_message, 404, {'Content-Type': 'text/html'}


def get_path_in_public(path):
  if not '.' in os.path.splitext(path)[-1]:
    path = os.path.join(path, 'index.html')
  relative_path = os.path.relpath(os.path.dirname(__file__), '/code/root')
  return os.path.join(relative_path, 'public', path)


def get_mime(path):
  extension = os.path.splitext(path)[-1]
  return mimetypes.types_map[extension]


def is_binary(path):
  _, file_extension = os.path.splitext(path)
  return file_extension in ['.ico', '.png', '.jpg', '.gif']


if __name__ == "__main__":
  app.run(host='0.0.0.0', port=5000)
