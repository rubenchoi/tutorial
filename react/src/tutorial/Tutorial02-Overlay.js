import React from 'react';
import { Card, CardBody, CardImg, CardSubtitle, CardText, CardTitle, Nav, NavItem, NavLink } from 'reactstrap';

function TestOverlay() {
  return (<>
    <div style={{ width: '100vw', height: '100vh', padding: '3em', backgroundImage: "url('/images/cover.jpg')" }}>
      <div style={{ width: '300px', padding: '2em', background: 'rgba(255, 255, 255, 0.5)', border: '2px solid gray' }}>
        <Card>
          <CardImg top src="/images/logo.jpg" alt="Ruben Choi" />
          <CardBody>
            <CardTitle tag="h5">루벤초이</CardTitle>
            <CardSubtitle tag="h6" className="mb-2 text-muted">React 3D</CardSubtitle>
            <CardText>루벤초이는 IT 개발자일까요 뮤지션일까요? 멜론에서 루벤초이를 검색해보세요.</CardText>
          </CardBody>
        </Card>
      </div>
    </div >
    <hr />
    <Nav pills>
      <NavItem>
        <NavLink href="https://rubenchoi.tistory.com/13" active target='_blank'>[Tutorial] 예제로 보는 React - Overlay</NavLink>
      </NavItem>
    </Nav>
  </>);
}

export default TestOverlay;
