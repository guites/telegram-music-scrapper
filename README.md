# Telegram Music Scrapper

O objetivo desse projeto é pegar músicas jogadas em um canal do telegram através de URLs do youtube.

## Instalação

O projeto é composto de uma API Web escrita em Python, um frontend em React e um módulo de IA para treinamento do modelo de linguagem natural.

### Iniciando a API Web

Todos os passos abaixo devem ser realizados no diretório `app/`.

Crie um ambiente virtual.

    python3 -m venv .venv

Ative o ambiente.

    source .venv/bin/activate

Instale as dependências.

    pip3 install -r requirements.txt

#### Configurações da API

Você vai precisar de um arquivo `.env` com as seguintes propriedades:

    TELEGRAM_API_ID=123456345745
    TELEGRAM_API_HASH=asifhafio98asu890asfhoi
    TELEGRAM_APP_TITLE=MyTelegramApp
    TELEGRAM_SHORT_TITLE=myshorttitle
    TELEGRAM_CHANNEL_ID=123445667
    DATABASE_PATH=/absolute/path/to/your/database/file.sql

Para conseguir os valores de `TELEGRAM_API_ID`, `TELEGRAM_API_HASH`, `TELEGRAM_APP_TITLE` e `TELEGRAM_SHORT_TITLE`, você precisa criar um aplicativo no telegram. Você pode fazer isso seguindo [estas instruções](https://core.telegram.org/api/obtaining_api_id).

O `TELEGRAM_CHANNEL_ID` pode ser retirado da URL do seu grupo no telegram. Por exemplo, na URL

    https://web.telegram.org/z/#-12223346006

o `CHANNEL_ID` será `12223346006`.

#### Criando sessões para acesso ao Telegram

Primeiro, rode o script `TelegramApi.py` diretamente, da raíz do repositório.

    python3 -m TelegramApi

Siga as instruções para cadastrar uma nova sessão para uso do Telegram.

**Aviso**: esta etapa vai envolver a verificação de um número de celular registrado no telegram.

#### Rodando a API

Rode o projeto com (o comando deve ser rodado da raíz do repositório, ou seja, fora do diretório app/)

    uvicorn main:app --reload

Você pode verificar a documentação em `http://localhost:8000/docs`.

#### Ativando o pre-commit

Este projeto tem uma série de pre-commit hooks instalados através do [pre-commit](https://pre-commit.com/). Ele é instalado junto com as dependências da API, e precisa ser ativado. Pra isso, certifique-se de que está com o ambiente virtual ativo. Depois, na raíz do projeto, rode

    pre-commit install

Você pode testá-lo com

    pre-commit run --all-files

Agora, os hooks irão rodar antes de cada commit.

### Iniciando o Front End

Acesse o diretório `frontend` e instale as dependências do javascript usando npm.

    npm install

#### Rodando o front end

Dentro do diretório `frontend`, rode o comando:

    npm start

A aplicação ficará disponível em <http://localhost:3000>.

#### Configurando o módulo de IA

Com os dados extraídos do telegram e anotados através do frontend, podemos utilizar o módulo de IA para treinar um modelo de processamento de linguagem natural (NLP) utilizando a biblioteca [spaCy](https://spacy.io/).

Para ativar o módulo de IA, leia o README.md disponível em `app/spacy`.
