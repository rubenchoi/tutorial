import './App.css';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import React from 'react';
import AndroidApp from './android/AndroidApp.js';
import Viewer from './viewer/Viewer';
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink } from 'reactstrap';
import Tutorial from './tutorial/Tutorial.js';

function App() {
  const [collapsed, setCollapsed] = React.useState(true);

  const toggleNavbar = () => setCollapsed(!collapsed);

  if (navigator.userAgent.toLowerCase().includes("android")) {
    return (<AndroidApp />)
  }

  return (
    <div className="App">
      <Navbar color="faded" light>
        <NavbarBrand href="/" className="mr-auto">Ruben Choi's React 3D Tutorial</NavbarBrand>
        <NavbarToggler onClick={toggleNavbar} className="mr-2" />
        <Collapse isOpen={!collapsed} navbar>
          <Nav navbar>
            <NavItem>
              <NavLink href="/test01">Props/state</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="/test02">Overlay</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="/test03">Webcam</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="/test04">Class vs. Hook</NavLink>
            </NavItem>
            <NavItem>
              <NavLink href="/test05">Webcam to Canvas</NavLink>
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
            <Tutorial.T01 message="I am your father." />
          </Route>
          <Route path="/test02">
            <Tutorial.T02 />
          </Route>
          <Route path="/test03">
            <Tutorial.T03 />
          </Route>
          <Route path="/test04">
            <Tutorial.T04 />
          </Route>
          <Route path="/test05">
            <Tutorial.T05 />
          </Route>
          <Route path="/">
            <Viewer />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
