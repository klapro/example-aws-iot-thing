import { mqtt, iot } from 'aws-iot-device-sdk-v2';

const appDir: string = process.cwd();

let builder: iot.AwsIotMqttConnectionConfigBuilder = iot.AwsIotMqttConnectionConfigBuilder.new_mtls_builder_from_path(
  `${appDir}/resources/certs/certificate.pem.crt`,
  `${appDir}/resources/certs/private.pem.key`,
);

//builder.with_certificate_authority_from_path("./certs/RootCA.pem");
builder.with_endpoint("ajika3uspzv9m-ats.iot.us-east-1.amazonaws.com");
builder.with_client_id("sdk-nodejs-v2");

let config: mqtt.MqttConnectionConfig = builder.build();
const client = new mqtt.MqttClient();
let connection: mqtt.MqttClientConnection = client.new_connection(config);

let fetchData = function (stationId: number) {
  var temp = getRandomValue(-50, 51) + '';
  var humd = getRandomValue(0, 101) + '';
  var windDir = getRandomValue(0, 361) + '';
  var windInt = getRandomValue(0, 101) + '';
  var rainHeig = getRandomValue(0, 51) + '';
  var timestamp = new Date().getTime() + '';

  return JSON.stringify({
      "id": stationId,
      "timestamp": timestamp,
      "temperature": temp,
      "humidity": humd,
      "windDirection": windDir,
      "windIntensity": windInt,
      "rainHeight": rainHeig
  });
}

let getRandomValue = (min: number, max: number) => {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

(async () => {
  const timer = setInterval(() => { }, 60 * 1000);
  
  await connection.connect();
  
  let counter: number = 0;

  setInterval(() => {
    console.log(" [x] Sent %s from station 1", counter);
    connection.publish('sensor/values', fetchData(1), mqtt.QoS.AtLeastOnce);
    console.log(" [x] Sent %s from station 2", counter);
    connection.publish('sensor/values', fetchData(2), mqtt.QoS.AtLeastOnce);
    counter++
  }, 3000);
  
})().catch((exception: any) => {
  console.log("APP FAILED.");
  console.log(exception);
});


