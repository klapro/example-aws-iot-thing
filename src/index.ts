import { mqtt, iot } from 'aws-iot-device-sdk-v2';
import { Context } from 'aws-lambda';

let getRandomValue = (min: number, max: number) => {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

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

export default async (event: any, context: Context): Promise<void> => {
  
  let builder: iot.AwsIotMqttConnectionConfigBuilder = iot.AwsIotMqttConnectionConfigBuilder.new_mtls_builder(
    process.env.CERT,
    process.env.PRIVATE_KEY
  );

  builder.with_endpoint(process.env.ENDPOINT);
  builder.with_client_id(process.env.CLIENT_ID);

  let config: mqtt.MqttConnectionConfig = builder.build();
  const client = new mqtt.MqttClient();
  let connection: mqtt.MqttClientConnection = client.new_connection(config);
  await connection.connect();
  connection.publish('sensor/values', fetchData(1), mqtt.QoS.AtLeastOnce);
  await connection.disconnect();
}




