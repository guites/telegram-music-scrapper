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

Por enquanto o programa é composto de um arquivo `main.py` e um jupyter notebook `YoutubeURLsPOC.ipynb`.

### O script `main.py`

Esse script vai ir salvando mensagens do grupo do telegram configurado, e salvando elas de 100 em 100 em arquivos .json.

Cada vez que você rodar o programa, ele vai salvar 200 mensagens, usando o último arquivo .json pra saber de onde começar.

Você pode rodá-lo com:

    python3 main.py

Ele vai criar um estrutura de arquivos no formato:

    65135-messages.json	66148-messages.json
    65335-messages.json	66351-messages.json
    65536-messages.json	66553-messages.json
    65740-messages.json	66759-messages.json
    65943-messages.json	

Esse script é um ponto de partida para a criação de um scrapper mais robusto.

### O caderno `YoutubeURLsPOC.ipynb`

Inicie o jupyter notebook com

    jupyter-notebook

Abra o caderno `YoutubeURLsPOC.ipynb`. Você pode ir rodando célula a célula.

Ele contém alguns exemplos de como podemos usar os resultados da API do telegram para:

- Filtrar mensagens que contém URLs do youtube
- Verificar quais URLs possuem vídeos de música usando o site everynoise
- Verificar quais URLs possuem vídeos de música usando a API do spotify (não implementado)


## Referências

- <https://betterprogramming.pub/how-to-get-data-from-telegram-82af55268a4b>
- <https://github.com/amiryousefi/telegram-analysis>
- <https://docs.telethon.dev/en/stable/quick-references/client-reference.html#chats>
- <https://github.com/LonamiWebs/Telethon>
