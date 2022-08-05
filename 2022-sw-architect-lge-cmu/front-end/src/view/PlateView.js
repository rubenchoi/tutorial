/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-template */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-case-declarations */
/* eslint-disable arrow-body-style */
import { IconButton } from '@mui/material';
import { useEffect, useState, useContext } from 'react';
import Draggable from 'react-draggable';
import { Button, Card, CardBody, CardImg, CardSubtitle, CardTitle, Col, Row, UncontrolledAlert } from 'reactstrap';
import Iconify from '../components/Iconify';
import { ModelContextStore } from '../model/ModelStore';

const BORDER_COLOR = 'rgba(245, 220, 145, 0.8)';

function PlateView() {
  const modelContext = useContext(ModelContextStore);

  const [alert, setAlert] = useState(undefined);
  const [found, setFound] = useState(undefined);
  const [isPartial, setIsPartial] = useState(false);

  useEffect(() => {
    if (modelContext.response === undefined) {
      return;
    }
    console.log("modelContext.response", modelContext.response);
    switch (modelContext.response.type) {
      case 'searchResult':
        try {
          const platesFound = modelContext.response.data;
          if (platesFound === undefined) {
            return;
          }
          // console.log(platesFound);
          if (platesFound.length < 1) {
            return;
          }
          setIsPartial(platesFound.length > 1);

          // TODO when multiple
          const m = platesFound[0];
          console.log(m);
          switch (m.status) {
            case "Owner Wanted":
            case "Stolen":
            case "Unpaid Fines - Tow":
              setTimeout(() => setAlert(undefined), 3000);
              const s = m.plate + " - " + m.status + "!!";
              setAlert(s);
              break;
            case "No Wants/Warrants":
              break;
            default:
              break;
          }
          if (!found || (found.plate !== m.plate)) {
            setFound(m);
          }
        } catch (err) {
          console.error(err);
        }
        break;
      default:
        break;
    }
  }, [modelContext.response])

  const getBirth = (birth) => {
    return birth;
  }

  const getCard = m => {
    const sz1 = '4';
    return (
      <Card
        style={{ width: '100%', border: '10px solid ' + BORDER_COLOR }}
        color={m.status === "No Wants/Warrants" ? 'black' : 'red'}>
        <CardImg
          alt="car image"
          src={'/static/icons/logo_team.png'}
          top
          width="100%"
          height="100px"
        />
        <CardBody>
          <CardTitle tag="h5">
            {m.plate} {isPartial && '[Partial Match]'}
          </CardTitle>
          <CardSubtitle
            className="mb-2 text-muted"
            tag="h6"
          >
            {m.status}
          </CardSubtitle>
          <div>
            <Row>
              <Col xs={sz1}>Registration:</Col>
              <Col> {m.registration}</Col>
            </Row>
            <Row>
              <Col xs={sz1}>Owner:</Col>
              <Col> {m.ownerName} {getBirth(m.ownerBirth)}</Col>
            </Row>
            <Row>
              <Col xs={sz1}>Address:</Col>
              <Col> {m.ownerAddress}, {m.ownerCity}</Col>
            </Row>
            <Row>
              <Col xs={sz1}>Vehicle</Col>
              <Col> {m.vehicleYear} / {m.vehicleMaker} / {m.vehicleModel} / {m.vehicleColor}</Col>
            </Row>
          </div>
          <hr />
          <Button color="secondary" onClick={() => setFound(undefined)}>
            CLOSE
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (<div style={{ position: 'absolute', top: 0, width: '100%', zIndex: 2 }}>
    {found && <>
      <Draggable handle=".handle">
        <div style={{
          position: 'fixed',
          width: '500px',
          top: '20%',
          left: '50%',
          marginLeft: '-250px',
          zIndex: 3
        }}>
          <div className="handle" style={{ width: '40px', background: BORDER_COLOR }}>
            <IconButton>
              <Iconify icon="el:move" />
            </IconButton>
          </div>
          {getCard(found)}
        </div>
      </Draggable>
    </>
    }

    {alert &&
      <div style={{ position: 'fixed', top: '20%', width: '60%', zIndex: 3 }}>
        {alert && <UncontrolledAlert color="danger">{alert}</UncontrolledAlert>}
      </div>
    }
  </div >);
}

export default PlateView;