import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';


export const Header = () => {
	return (
		<>
			<Navbar bg="dark" variant="dark">
				<Container>
					<Navbar.Brand href="/">Band Hunter</Navbar.Brand>
					<Nav className="my-auto">
						<Nav.Link href="/messages" target='_self'>Messages</Nav.Link>
						<Nav.Link href="/artists" target='_self'>Artists</Nav.Link>
						<Nav.Link href="/maps" target='_self'>Maps</Nav.Link>
						<Nav.Link href="http://localhost:8000/docs" target='_blank'>Docs API</Nav.Link>
					</Nav>
				</Container>
			</Navbar>
		</>
	)
};