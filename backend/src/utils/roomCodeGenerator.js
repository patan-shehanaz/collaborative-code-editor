const { nanoid } = require('nanoid');

// Short, URL-friendly, shareable room code, e.g. "x7Qa2K9d"
const generateRoomCode = () => nanoid(8);

module.exports = generateRoomCode;
