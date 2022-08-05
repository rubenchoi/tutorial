import express from 'express';

// import { apiPlate } from './apiPlate.Solr.js';
import { apiPlate, apiPlatePartial } from './apiPlate.js';
import { apiPlateFaked } from './apiPlateFaked.js';
import { userFind } from './auth.js'
// import { createRequire } from "module";
// const require = createRequire(import.meta.url);
import morgan from 'morgan';
import cors from 'cors';
import http from 'http';
import https from 'https';

import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { addPerfLog, performanceSummary } from './perfLog.js'
import { readFile } from 'fs/promises';

const jsonconfig = JSON.parse(
  await readFile(
    new URL('../conf/config.json', import.meta.url)
  )
)

const DEFAULT_PORT_HTTP = 3502;
const DEFAULT_PORT_HTTPS = 3503;

let unauthoized_access_count = 0;
const INTRUDER_WARNING_NOTIFY_COUNT = 5;


var server_start_date = new Date().getTime();

export default class RestApiServer {
  constructor(tlsOption, portHttp = DEFAULT_PORT_HTTP, portHttps = DEFAULT_PORT_HTTPS, mqtt) {
    this.portHttp = portHttp;
    this.portHttps = portHttps;
    this.mqtt = mqtt;

    const app = express();
    dotenv.config();
    app.use(cors());

    app.use(morgan('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // access token을 secret key 기반으로 생성
    const generateAccessToken = (id) => {
      return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: jsonconfig.jwt_token_expiration
      });
    };

    // refersh token을 secret key  기반으로 생성
    const generateRefreshToken = (id) => {
      return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "180 days",
      });
    };

    // login 요청 및 성공시 access token, refresh token 발급
    app.post("/login", async (req, res) => {
      let id = req.body.id;
      let pw = req.body.pw;


      const person = await userFind.findOne({ 'id': id }, 'id passwd');

      if (person == null || person.id === "")
        return res.sendStatus(401);

      if (id === person.id && pw === person.passwd) {
        let accessToken = generateAccessToken(id);
        let refreshToken = generateRefreshToken(id);

        res.json({ accessToken, refreshToken });
      }
      else
        return res.sendStatus(401);

    });

    // access token의 유효성 검사
    const authenticateAccessToken = (req, res, next) => {
      let authHeader = req.headers["authorization"];
      let token = authHeader && authHeader.split(" ")[1];

      if (!token) {
        addUnauthorizedCount();
        console.log("wrong token format or token is not sended.");
        return res.sendStatus(400);
      }

      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
        if (error) {
          addUnauthorizedCount();
          console.log(error);
          return res.sendStatus(403);
        }

        req.user = user;
        next();
      });
    };

    const addUnauthorizedCount = () => {
      unauthoized_access_count += 1;
      console.log("Unauthorized access count =" + unauthoized_access_count);

      if (unauthoized_access_count % INTRUDER_WARNING_NOTIFY_COUNT == 0)
        notifyUnauthoziedAccess();
    }

    const notifyUnauthoziedAccess = () => {
      console.log("Notify unauthorized access to administrator.");
      const now = new Date(+new Date() + 3240 * 10000).toISOString().replace("T", " ").replace(/\..*/, '');
      this.mqtt.publish("Unauthorized access happened at " + now);
    }
    // add performance Log
    const addPerformanceLog = (req, res, next) => {
      next();
      //TODO EXAMPLE
      addPerfLog(req.user.id, 'LMY1285', new Date().getTime(), new Date().getTime(), 'exact');
    };


    // access token을 refresh token 기반으로 재발급
    app.post("/refresh", (req, res) => {
      let refreshToken = req.body.refreshToken;
      if (!refreshToken) return res.sendStatus(401);

      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (error, user) => {
          if (error) return res.sendStatus(403);

          const accessToken = generateAccessToken(user.id);

          res.json({ accessToken });
        }
      );
    });

    app.post('/plateFaked', authenticateAccessToken, addPerformanceLog, (req, res) => {
      return apiPlateFaked(req, res)
    });

    app.get('/platenumber/:platenumber', authenticateAccessToken, (req, res) => {
      return apiPlate(req, res, addPerfLog)
    });

    app.get('/performance', (req, res) => {
      var perflog = performanceSummary();
      return res.json(perflog);
    });

    app.get('/performance/start', (req, res) => {
      server_start_date = new Date().getTime();
      return res.json(server_start_date);
    });

    app.get('/performance/startdate', (req, res) => {
      return res.json(server_start_date);
    });

    const httpServer = http.createServer(app);
    httpServer.listen(this.portHttp, () => {
      this.debug('REST API HTTP server on ' + this.portHttp);
    });

    const httpsServer = https.createServer(tlsOption, app);
    httpsServer.listen(this.portHttps, () => {
      this.debug('REST API HTTPS server on ' + this.portHttps);
    });


    setTimeout(() => {
      notifyUnauthoziedAccess();
    }, 3000);
  }

  debug = m => console.log('[RestApiServer]', m);
}
