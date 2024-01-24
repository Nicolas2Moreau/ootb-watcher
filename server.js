const express = require('express');
const bodyParser = require('body-parser');
const redis = require('redis');

const app = express();
const port = process.env.PORT || 3000;

const client = redis.createClient();
const apiKey = process.env.API_KEY || 'default_api_key';

app.use(bodyParser.json());

const checkApiKey = (req, res, next) => {
  const providedApiKey = req.headers['api-key'];

  if (!providedApiKey || providedApiKey !== apiKey) {
    return res.status(401).json({ message: 'Unauthorized. Invalid API key.' });
  }

  next();
};

app.post('/createMission', checkApiKey, (req, res) => {
  const { corporationId, missionName, details } = req.body;

  const missionEvent = {
    corporationId,
    eventType: 'mission_created',
    data: {
      missionId: generateUniqueId(),
      missionName,
      details,
    },
  };

  client.publish('mission', JSON.stringify(missionEvent));

  res.status(200).json({ message: 'Mission created successfully' });
});

const generateUniqueId = () => {
  return Math.floor(Math.random() * 100000).toString();
};

app.listen(port, () => {
  console.log(`Redis Server listening at http://localhost:${port}`);
});
