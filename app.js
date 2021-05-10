const http = require("http");
const fs = require("fs");

const PORT = 9000;

const server = http.createServer((req, res) => {
  const { method, url } = req;
  //parse url
  const [urlNoQueryParams] = url.split("?");
  const [, domain, uriParamMultiplier] = urlNoQueryParams.split("/");
  //response format
  res.setHeader("Content-type", "application/json");

  if (domain === "myNumber") {
    // GET METHOD
    if (urlNoQueryParams === "/myNumber" && method === "GET") {
      let rawData = fs.readFileSync("./data/number.json");
      let parseData = JSON.parse(rawData);
      if(Object.keys(parseData).length === 0){
        res.statusCode = 404;
        return res.end(JSON.stringify({
          message:'no value stored'
        }))
      }
      console.log(parseData.myNumber)
      return res.end(JSON.stringify(parseData));
    }
    // POST METHOD
    if (urlNoQueryParams === "/myNumber" && method === "POST") {
      let rawData = fs.readFileSync("./data/number.json");
      let parseData = JSON.parse(rawData);
      if (parseData.myNumber) {
        res.statusCode = 409;
        return res.end(
          JSON.stringify({
            message: "Upss!!! my number already exists",
          })
        );
      } else {
        let rawBody = [];
        req.on("data", (chunk) => {
          rawBody.push(chunk);
        });
        req.on("end", () => {
          const buffer = Buffer.concat(rawBody).toString();
          const body = JSON.parse(buffer);

          const checkIsNumber = isNaN(body.myNumber);
          if (checkIsNumber) {
            res.statusCode = 400;
            return res.end(
              JSON.stringify({
                message: "value must be numeric type",
              })
            );
          }

          const data = JSON.stringify(body);
          fs.writeFileSync("./data/number.json", data);
          res.statusCode = 201;
          res.end(
            JSON.stringify({
              message: "my number succesfully crated",
            })
          );
        });
      }
      return;
    }
    // PUT METHOD
    if (urlNoQueryParams === "/myNumber" && method === "PUT") {
      let rawBody = [];
      req.on("data", (chunk) => {
        rawBody.push(chunk);
      });
      req.on("end", () => {
        const buffer = Buffer.concat(rawBody).toString();
        const body = JSON.parse(buffer);

        const checkIsNumber = isNaN(body.myNumber);
        if (checkIsNumber) {
          res.statusCode = 400;
          return res.end(
            JSON.stringify({
              message: "value must be numeric type",
            })
          );
        }

        const data = JSON.stringify(body);
        fs.writeFileSync("./data/number.json", data);
        //TODO no estoy muy seguro si usar el codigo 202 aqui
        res.statusCode = 200;
        res.end(
          JSON.stringify({
            message: "number updated succesfully!!!",
            number: body,
          })
        );
      });
      return;
    }
 
    // METHOD GET FOR MULTIPLIER
    const multiplierRegex = /^\/myNumber\/\d+$/;
    if (multiplierRegex.test(urlNoQueryParams)) {
      const multiplier = parseInt(uriParamMultiplier, 10);
      let rawData = fs.readFileSync("./data/number.json");
      let parseData = JSON.parse(rawData);
      if (method === "GET") {
        if(Object.keys(parseData).length === 0){
          res.statusCode = 404;
          res.end(JSON.stringify({
            message:'no value stored'
          }))
        }
        if (parseData.myNumber) {
          res.statusCode = 200;
          let result = multiplier * Number(parseData.myNumber);
          return res.end(
            JSON.stringify({
              value: result,
            })
          );
        } else {
          res.statusCode = 400;
          return res.end(
            JSON.stringify({
              message: "Ups!!! there is no number",
            })
          );
        }
      }
    }
  }
  if (domain === "reset") {
    if (urlNoQueryParams === "/reset") {
      if (method === "DELETE") {
        fs.writeFileSync("./data/number.json", JSON.stringify({}));
        res.statusCode = 200;
        res.end(
          JSON.stringify({
            message: "myNumber deleted succesfully",
          })
        );
      }
    }
  }
  res.statusCode = 404;
  return res.end(
    JSON.stringify({
      message: "resource not found",
    })
  );
});

server.listen(PORT, "localhost", null, () => {
  console.log(`app is running at port ${PORT}`);
});
