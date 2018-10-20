import React, { Component } from "react";
import { LinkContainer } from "react-router-bootstrap";
import { Link } from "react-router-dom";
import { Nav, Navbar, NavItem } from "react-bootstrap";
import "./styles/App.css";
import Routes from "./Routes";

class App extends Component {
  render() {
    return (
      <div className="App container">
        <Navbar fluid collapseOnSelect>
          <Navbar.Header>
            <Navbar.Brand>
              <Link to="/">AppSearch</Link>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
		  <Navbar.Collapse>
			  <Nav pullRight>
			  	<LinkContainer to="/about">
            <NavItem href="/about">About</NavItem>
				  </LinkContainer>
			  </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Routes />
      </div>
    );
  }
}

export default App;