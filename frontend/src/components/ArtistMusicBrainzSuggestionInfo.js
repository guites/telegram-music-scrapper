import { Button, ListGroup } from 'react-bootstrap';
import getArtistPositions from '../functions/getArtistPositions';
const getSuggestionLiStacked = (label, value, key) => {
	return (
		<ListGroup.Item key={key}>
			<div>
				<div className="fw-bold">
					<small>{label}</small>
				</div>
				<small>{value}</small>
			</div>
		</ListGroup.Item>
	);
};

const getSuggestionLi = (label, value, key) => {
	return (
		<ListGroup.Item key={key}>
			<small>
				<strong>{label}</strong>: {value}
			</small>
		</ListGroup.Item>
	);
};



export const ArtistMusicBrainzSuggestionInfo = props => {
	const { suggestion, onConfirmArtist } = props;
	if (!suggestion) {
		return null;
	}
	const suggestionEls = [];
	suggestionEls.push(
		getSuggestionLiStacked(
			'MusicBrainz id',
			suggestion['mbid'],
			`${suggestion['mbid']}-0`,
		),
	);
	suggestionEls.push(
		getSuggestionLiStacked(
			'Name',
			suggestion['name'],
			`${suggestion['mbid']}-1`,
		),
	);
	suggestionEls.push(
		getSuggestionLi(
			'Score',
			suggestion['score'],
			`${suggestion['mbid']}-2`,
		),
	);
	suggestionEls.push(
		getSuggestionLi(
			'Ended',
			suggestion['life-span-ended'],
			`${suggestion['mbid']}-3`,
		),
	);

	if (suggestion['type']) {
		suggestionEls.push(
			getSuggestionLi(
				'Type',
				suggestion['type'],
				`${suggestion['mbid']}-4`,
			),
		);
	}

	if (suggestion['area-name']) {
		suggestionEls.push(
			getSuggestionLi(
				'Area',
				suggestion['area-name'],
				`${suggestion['mbid']}-5`,
			),
		);
	}

	if (suggestion['country']) {
		suggestionEls.push(
			getSuggestionLi(
				'Country',
				suggestion['country'],
				`${suggestion['mbid']}-6`,
			),
		);
	}

	if (suggestion['life-span-begin']) {
		suggestionEls.push(
			getSuggestionLi(
				'Life span begin',
				suggestion['life-span-begin'],
				`${suggestion['mbid']}-7`,
			),
		);
	}

	if (suggestion['life-span-end']) {
		suggestionEls.push(
			getSuggestionLi(
				'Life span end',
				suggestion['life-span-end'],
				`${suggestion['mbid']}-8`,
			),
		);
	}

	if (suggestion['begin-area-name']) {
		suggestionEls.push(
			getSuggestionLi(
				'Begin area',
				suggestion['begin-area-name'],
				`${suggestion['mbid']}-9`,
			),
		);
	}

	if (suggestion['disambiguation']) {
		suggestionEls.push(
			getSuggestionLi(
				'Disambiguation',
				suggestion['disambiguation'],
				`${suggestion['mbid']}-10`,
			),
		);
	}

	if (suggestion['coordinates']) {
		const previewUrl = `https://maps.google.com/?q=${suggestion['coordinates']['lat']},${suggestion['coordinates']['lon']}`;
		suggestionEls.push(
			getSuggestionLi(
				'Preview coordinates',
				previewUrl,
				`${suggestion['mbid']}-11`,
			),
		);
	}

	suggestionEls.push(
		<Button
			key={`${suggestion['mbid']}-12`}
			onClick={async () =>
				onConfirmArtist(await getArtistPositions(suggestion))
			}
		>
			Confirm artist
		</Button>,
	);

	return <ListGroup variant="flush">{suggestionEls}</ListGroup>;
};
