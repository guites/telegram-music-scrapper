const API_URL = 'http://localhost:8000';

const read_registered_artists = async () => {
    const url = new URL(`${API_URL}/telegram_messages/artists`);
    const request = await fetch(url);
    const json_artists = await request.json();
    return json_artists;
};

const read_telegram_messages = async (offset_id) => {
    const url = new URL(`${API_URL}/telegram_messages/`)

    const params = {
        site_name: 'YouTube',
    };
    if (offset_id !== null) {
        params.offset_id = offset_id;
    }

    url.search = new URLSearchParams(params).toString();

    const raw_messages = await fetch(url);
    const json_messages = await raw_messages.json();
    return json_messages;
};

const sync_telegram_messages = async () => {
    const raw_messages = await fetch(`${API_URL}/telegram_messages/sync`, {method: 'POST'});
    const json_messages = await raw_messages.json();
    return json_messages;
}

export { read_telegram_messages, sync_telegram_messages, read_registered_artists };