const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// simple health check
app.get('/', (req, res) => {
  res.send({ message: 'Schedule Skies API is running' });
});

// TODO: add routes for weather, traffic, and planning logic

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
