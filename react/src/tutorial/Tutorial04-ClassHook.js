import React from 'react';
import { Nav, NavItem, NavLink } from 'reactstrap';
import TestClass from '../subcontents/Tutorial04-sub-Class.js';
import TestHook from '../subcontents/Tutorial04-sub-Hook.js';

function ClassHook(props) {
  return (
    <div style={{ margin: '1em' }}>
      <h2>Class vs. Hook</h2>
      <table>
        <thead>
          <tr>
            <td>Class</td>
            <td>Hook</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><TestClass /></td>
            <td><TestHook /></td>
          </tr>
        </tbody>
      </table>

      <hr />
      <Nav pills>
        <NavItem>
          <NavLink href="https://rubenchoi.tistory.com/5" active target='_blank'>[Tutorial] React 문법 - Class vs. Hook</NavLink>
        </NavItem>
      </Nav>
    </div>
  );
}

export default ClassHook;
