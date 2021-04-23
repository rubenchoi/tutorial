import React from 'react';
import { Badge, Button, Nav, NavItem, NavLink } from 'reactstrap';

const ANSWER_AT_HOME = "I am your son.";
const ANSWER_AS_JEDI = "May force be with you.";

function ButtonClickTest(props) {
  const [message, setMessage] = React.useState(ANSWER_AT_HOME);

  const handleClick = () => {
    setMessage(message === ANSWER_AT_HOME ? ANSWER_AS_JEDI : ANSWER_AT_HOME);
  }

  return (
    <div style={{ margin: '1em' }}>
      <h2>Button Click Test</h2>
      <div style={{ padding: '1em' }}>
        <Button color="info" onClick={handleClick}>
          {message !== ANSWER_AT_HOME ? "at Home" : "be Jedi"}
        </Button>
        <div style={{ padding: '2em' }}>
          <p><Badge color="warning">Props</Badge> "{props.message}"</p>
          <p><Badge color="success">State</Badge> "{message}"</p>
        </div>
      </div>
      <hr />
      <Nav pills>
        <NavItem>
          <NavLink href="https://rubenchoi.tistory.com/12" active target='_blank'>[Tutorial] 예제로 보는 React - props and state</NavLink>
        </NavItem>
      </Nav>
    </div>
  );
}

export default ButtonClickTest;
