//Weather API of Korea Meteorlogical Administration 
const http = require('http');

const DEFAULT_PARAM = { city: '서울특별시', area: '서초구', region: '양재1동' }
const SERVICE_KEY = "mef7i3p15XsNxyYygWPIFoIsCs8cCfYdhfAnDuk1dCg9a1AZT%2BOMHmxEvDKGxoDbPOi7WhoVehcgqHYxeD05BQ%3D%3D";

module.exports = class WeatherApiHandler {
    constructor(params = DEFAULT_PARAM) {
        this.params = params;
        this.address = params.city + " " + params.area + " " + params.region;
    }

    requestLocationAPI = (url, key, title) => {
        return new Promise((resolve, reject) => {
            console.log("Request " + title + "s: ", url);
            http.get(url, (res) => {
                try {
                    let json = "";
                    res.on("data", (chunk) => json += chunk);
                    res.on("end", () => {
                        let codes = JSON.parse(json);

                        console.log(title + "s: ", codes);
                        let selected;
                        codes.forEach(item => {
                            if (item.value === key) {
                                selected = item;
                            }
                        });
                        console.log("----found " + title + ": ", selected, "\n\n");
                        resolve(selected);
                    });

                } catch (err) {
                    console.log("ERROR", err);
                    reject(err);
                }
            });
        });
    }

    locationAPI = ({ city, area, region }) => {
        return new Promise((resolve, reject) => {
            let url = "http://www.kma.go.kr/DFSROOT/POINT/DATA/top.json.txt";
            this.requestLocationAPI(url, city, "CityCode").then(
                r => {
                    url = "http://www.kma.go.kr/DFSROOT/POINT/DATA/mdl." + r.code + ".json.txt";
                    r = this.requestLocationAPI(url, area, "AreaCode").then(
                        r => {
                            url = "http://www.kma.go.kr/DFSROOT/POINT/DATA/leaf." + r.code + ".json.txt";
                            r = this.requestLocationAPI(url, region, "RegionCode").then(
                                r => resolve(r)
                            );
                        }
                    );
                }
            );
        });
    }

    getToday = () => {
        var date = new Date();
        var year = date.getFullYear();
        var month = ("0" + (1 + date.getMonth())).slice(-2);
        var day = ("0" + date.getDate()).slice(-2);
        return year + month + day;
    }

    createRequestUrl = (x, y) => {
        return "http://apis.data.go.kr/1360000/VilageFcstInfoService/getVilageFcst?serviceKey="
            + SERVICE_KEY
            + "&pageNo=1&numOfRows=10&dataType=JSON&base_date="
            + this.getToday()
            + "&base_time=0500&nx=" + x + "&ny=" + y;
    }

    createComment = (json) => {
        try {
            let data = json.response.body.items.item;
            let info = {}
            for (let i = 0; i < data.length; i++) {
                let item = data[i];
                switch (item.category) {
                    case "SKY":
                        let cloudy = parseInt(item.fcstValue);
                        if (cloudy > 8) {
                            info.sky = '흐림';
                        } else if (cloudy > 5) {
                            info.sky = '구름많음';
                        } else {
                            info.sky = '맑음';
                        }
                        break;
                    case "TMN":
                        info.morning = item.fcstValue;
                        break;
                    case "TMX":
                        info.highest = item.fcstValue;
                        break;
                    default:
                        break;
                }
            }

            let r = this.address + " 지역의 오늘 날씨는 " + info.sky
                + (info.morning ? (". 아침 최저기온은 " + info.morning + (info.highest ? "도이고 " : "도입니다.")) : '')
                + (info.highest ? (" 낮 최고기온은 " + info.highest + "도까지 오르겠습니다.") : '');
            return r;
        } catch (err) {
            console.log(err);
            return "죄송합니다만 오늘은 날씨가 오락가락해서 예보가 어렵네요. 관리자에게 물어보세요."
        }
    }

    weatherAPI = () => {
        return new Promise((resolve, reject) => {
            this.locationAPI(this.params).then(r => {
                const url = this.createRequestUrl(r.x, r.y);
                http.get(url, (res) => {
                    var json = "";
                    res.on("data", (chunk) => {
                        json += chunk;
                    });

                    res.on("end", () => {
                        resolve(this.createComment(JSON.parse(json)));
                    });
                });
            });
        });
    }
}