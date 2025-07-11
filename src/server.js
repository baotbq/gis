const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // Cho phép tất cả origin

// Hoặc chỉ cho frontend cụ thể
// app.use(cors({ origin: 'http://localhost:3000' }));

