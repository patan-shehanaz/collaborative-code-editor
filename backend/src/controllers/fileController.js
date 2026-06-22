const File = require('../models/File');

const listFiles = async (req, res) => {
  const files = await File.find({ room: req.room._id }).select('-yDocState');
  res.json(files);
};

const createFile = async (req, res, next) => {
  try {
    const { filename, language } = req.body;
    if (!filename) return res.status(400).json({ message: 'filename is required' });

    const file = await File.create({
      room: req.room._id,
      filename,
      language: language || req.room.defaultLanguage,
    });
    res.status(201).json(file);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'A file with that name already exists in this room' });
    }
    next(err);
  }
};

const renameFile = async (req, res, next) => {
  try {
    const { filename } = req.body;
    const file = await File.findOneAndUpdate(
      { _id: req.params.fileId, room: req.room._id },
      { filename },
      { new: true }
    );
    if (!file) return res.status(404).json({ message: 'File not found' });
    res.json(file);
  } catch (err) {
    next(err);
  }
};

const deleteFile = async (req, res, next) => {
  try {
    const file = await File.findOneAndDelete({ _id: req.params.fileId, room: req.room._id });
    if (!file) return res.status(404).json({ message: 'File not found' });
    res.json({ message: 'File deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listFiles, createFile, renameFile, deleteFile };
