# Telegram Music Scrapper

O objetivo desse projeto é pegar músicas jogadas em um canal do telegram através de URLs do youtube.

## Instalação

O projeto é composto de uma API escrita em Python e um frontend em React.

## Iniciando a API

Todos os passos abaixo devem ser realizados no diretório `app/`.

Crie um ambiente virtual.

    python3 -m venv .venv

Ative o ambiente.

    source .venv/bin/activate

Instale as dependências.

    pip3 install -r requirements.txt

### Configurações da API

Você vai precisar de um arquivo `.env` com as seguintes propriedades:

    TELEGRAM_API_ID=123456345745
    TELEGRAM_API_HASH=asifhafio98asu890asfhoi
    TELEGRAM_APP_TITLE=MyTelegramApp
    TELEGRAM_SHORT_TITLE=myshorttitle
    TELEGRAM_CHANNEL_ID=123445667
    DATABASE_PATH=/path/to/your/database/file.sql

Para conseguir os valores de `TELEGRAM_API_ID`, `TELEGRAM_API_HASH`, `TELEGRAM_APP_TITLE` e `TELEGRAM_SHORT_TITLE`, você precisa criar um aplicativo no telegram. Você pode fazer isso seguinte [estas instruções](https://core.telegram.org/api/obtaining_api_id).

O `TELEGRAM_CHANNEL_ID` pode ser retirado da URL do seu grupo no telegram. Por exemplo, na URL

    https://web.telegram.org/z/#-12223346006

o `CHANNEL_ID` será `12223346006`.

### Criando sessões para acesso ao Telegram

Primeiro, rode o script `TelegramApi.py` diretamente, da raíz do repositório.

    python3 -m app.TelegramApi

Siga as instruções para cadastrar uma nova sessão para uso do Telegram.

**Aviso**: esta etapa vai envolver a verificação de um número de celular registrado no telegram.

### Rodando a API

Rode o projeto com (o comando deve ser rodado da raíz do repositório, ou seja, fora do diretório app/)

    uvicorn app.main:app --reload

Você pode verificar a documentação em `http://localhost:8000/docs`.

### Configurando o extrator de entidades nomeadas (NER)

Com os dados gerados na plataforma, podemos treinar um modelo de processamento de linguagem natural (NLP) utilizando a biblioteca [spaCy](https://spacy.io/).

Para isso, você deve ajustar as configurações do modelo de acordo com a arquitetura da sua máquina.

TODO: finish writing this

## Iniciando o Front End

Acesse o diretório `frontend` e instale as dependências do javascript usando npm.

    npm install

### Rodando o front end

Dentro do diretório `frontend`, rode o comando:

    npm start

A aplicação ficará disponível em <http://localhost:3000>.
