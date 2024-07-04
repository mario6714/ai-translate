# About

### How to get it
download it in the releases section

### How it works
it receives text through clipboard changes or a configured websocket server, and then translate it with AI models. it is this way so it could receive text from tools like [textractor](https://github.com/Artikash/Textractor).

#### AI Models
in all models available you can get a free API key. I want this repo to be also a hub of nice and free AI models. if you have a suggestion of a model with a good provider, feel free to suggest me or open a PR.

### Caching
the translation of your favorite AI model (the first) is cached by default in **%appdata%\ai-translate**. it's cached in a **.xlsx** file, so it can be imported to translator++

### Demo
WIP

### Build
if you want to create your own build

```bash
# install the frontend dependencies
$ npm install

# install the python dependencies
$ pip install -r webview\pywebview\requirements.txt

# run the vite server (useful in development)
$ npm run dev

# build the html, css and js files
$ npm run build

# preview the webview
$ npm run start

# build the exe (python)
$ npm run pack
```

#### The addition of a webview in go is WIP

## todo
translate a game
add providers¹
finish the webview in go
-
implement drag and drop models
add providers²