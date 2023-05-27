import { read_artists_positions_by_openstreet } from '../requests'

const getArtistPositions = async suggestion => {
	// if the suggestion has no defined area value, skip it
	if (!suggestion['area-name'] && !suggestion['begin-area-name']) return suggestion

	const beginArea = suggestion['begin-area-name'] ?? '';
	const areaName = suggestion['area-name'] ?? '';
	const position = await read_artists_positions_by_openstreet(
		areaName,
		beginArea,
	);
	if (position.length === 0) {
		return suggestion;
	}

	const lat = position[0]['lat'];
	const lon = position[0]['lon'];

	const coordinates = {
		lat,
		lon,
	};
	console.log({
		...suggestion,
		coordinates,
	})
	return {
		...suggestion,
		coordinates,
	};
};

export default getArtistPositions;