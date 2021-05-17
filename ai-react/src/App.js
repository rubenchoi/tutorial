import './App.css';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import React from 'react';
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink } from 'reactstrap';
import Tutorial from './tutorial/Tutorial.js';

function App() {
  const [collapsed, setCollapsed] = React.useState(true);

  const toggleNavbar = () => setCollapsed(!collapsed);

  return (
    <div className="App">
      <Navbar color="faded" light>
        <NavbarBrand href="/" className="mr-auto">Ruben Choi's React AI Tutorial</NavbarBrand>
        <NavbarToggler onClick={toggleNavbar} className="mr-2" />
        <Collapse isOpen={!collapsed} navbar>
          <Nav navbar>
            <NavItem>
              <NavLink href="/test01">Face Detection</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="https://github.com/rubenchoi/tutorial">GitHub</NavLink>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>

      <Router>
        <Switch>
          <Route path="/test01">
            <Tutorial.T01 />
          </Route>
          <Route path="/">
            <Tutorial.T01 />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
