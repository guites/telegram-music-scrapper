# Telegram Music Scrapper

O objetivo desse projeto é pegar músicas jogadas em um canal do telegram através de URLs do youtube. 

## Instalação

Crie um ambiente virtual.

    python3 -m venv .venv

Ative o ambiente.

    source .venv/bin/activate

Instale as dependências.

    pip3 install -r requirements.txt

## Configuração

Você vai precisar de um arquivo `.env` com as seguintes propriedades:

    API_ID=123456345745
    API_HASH=asifhafio98asu890asfhoi
    APP_TITLE=MyTelegramApp
    SHORT_TITLE=myshorttitle
    CHANNEL_ID=123445667

Para conseguir os valores de `API_ID`, `API_HASH`, `APP_TITLE` e `SHORT_TITLE`, você precisa criar um aplicativo no telegram. Você pode fazer isso seguinte [estas instruções](https://core.telegram.org/api/obtaining_api_id).

O `CHANNEL_ID` pode ser retirado da URL do seu grupo no telegram. Por exemplo, na URL

    https://web.telegram.org/z/#-12223346006

o `CHANNEL_ID` será `12223346006`.

## Rodando o programa

Primeiro, rode o script `TelegramApi.py` diretamente, dentro da pasta app.

    python3 app/TelegramApi.py

Siga as instruções para cadastrar uma nova sessão para uso do Telegram.

Depois, rode o projeto com

    cd app && uvicorn main:app --reload

Você pode verificar a documentação em `http://localhost:8000/docs`.