const API_URL = 'http://localhost:8000';

const read_registered_artists = async () => {
    const url = new URL(`${API_URL}/artists`);
    const request = await fetch(url);
    const json_artists = await request.json();
    return json_artists;
};

const read_musicbrainz_suggestions = async artist_id => {
    const url = new URL(`${API_URL}/musicbrainz/artists/${artist_id}`);
    const request = await fetch(url);
    const response = await request.json();
    return response;
};

const read_artists_positions = async offset_id => {
    const url = new URL(`${API_URL}/artists/positions`);

    const requests = await fetch(url);
    const json_messages = await requests.json();
    return json_messages;
};

const read_artists_positions_by_openstreet = async (
    areaName,
    beginArea,
) => {
    const url = new URL(`https://nominatim.openstreetmap.org/search.php`);
    const query = beginArea ? `${areaName}, ${beginArea}` : areaName;

    const params = {
        q: query,
        format: 'jsonv2',
    };

    url.search = new URLSearchParams(params).toString();

    const requests = await fetch(url);
    const json_messages = await requests.json();
    return json_messages;
};

const read_telegram_message = async message_id => {
    const url = new URL(`${API_URL}/telegram_messages/${message_id}`);
    const request = await fetch(url);
    const json_message = await request.json();
    return json_message;
};

const read_telegram_messages = async offset_id => {
    const url = new URL(`${API_URL}/telegram_messages/`);

    const searchParams = new URLSearchParams();
    searchParams.append('site_name', 'YouTube');
    searchParams.append('unlabeled', 'true');
    searchParams.append('suggestions', 'true');
    if (offset_id !== null) {
        searchParams.append('offset_id', offset_id);
    }
    url.search = searchParams.toString();
    const raw_messages = await fetch(url);
    const json_messages = await raw_messages.json();
    return json_messages;
};

const sync_telegram_messages = async () => {
    const raw_messages = await fetch(`${API_URL}/telegram_messages/sync`, {
        method: 'POST',
    });
    const json_messages = await raw_messages.json();
    return json_messages;
};

const delete_artist = async artist_id => {
    const url = new URL(`${API_URL}/artists/${artist_id}`);
    const request = await fetch(url, { method: 'DELETE' });
    return request;
};

const create_dataset_message = async telegram_message_id => {
    const url = new URL(`${API_URL}/datasets/messages`);

    const searchParams = new URLSearchParams();
    searchParams.append('telegram_message_id', telegram_message_id);
    url.search = searchParams.toString();
    const request = fetch(url, {
        method: 'post',
    });
    return request;
};

export {
    read_telegram_messages,
    sync_telegram_messages,
    read_registered_artists,
    read_artists_positions,
    read_musicbrainz_suggestions,
    read_telegram_message,
    read_artists_positions_by_openstreet,
    delete_artist,
    create_dataset_message,
};
