import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';


export const Header = () => {
	return (
		<>
			<Navbar bg="dark" variant="dark">
				<Container>
					<Navbar.Brand href="#home">Band Hunter</Navbar.Brand>
					<Nav className="my-auto">
						<Nav.Link href="/" target='_self'>Home</Nav.Link>
						<Nav.Link href="/maps" target='_self'>Maps</Nav.Link>
						<Nav.Link href="http://localhost:8000/docs" target='_blank'>Docs API</Nav.Link>
					</Nav>
				</Container>
			</Navbar>
		</>
	)
};