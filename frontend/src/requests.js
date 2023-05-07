const API_URL = 'http://localhost:8000';

const read_registered_artists = async () => {
    const url = new URL(`${API_URL}/artists`);
    const request = await fetch(url);
    const json_artists = await request.json();
    return json_artists;
};

const read_musicbrainz_suggestions = async (artist_id) => {
	const url = new URL(`${API_URL}/musicbrainz/artists/${artist_id}`)
	const request = await fetch(url);
	const response = await request.json();
	return response;
};

const read_artists_positions = async (offset_id) => {
	const url = new URL(`${API_URL}/artists/positions`)

	const requests = await fetch(url);
	const json_messages = await requests.json();
	return json_messages;
};

const read_telegram_message = async (message_id) => {
	const url = new URL(`${API_URL}/telegram_messages/${message_id}`)
	const request = await fetch(url);
	const json_message = await request.json();
	return json_message;
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
	const raw_messages = await fetch(`${API_URL}/telegram_messages/sync`, { method: 'POST' });
	const json_messages = await raw_messages.json();
	return json_messages;
}

export { read_telegram_messages, sync_telegram_messages, read_registered_artists, read_artists_positions, read_musicbrainz_suggestions, read_telegram_message };
