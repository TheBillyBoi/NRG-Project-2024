const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sheet-music',
    allowed_formats: ['pdf', 'jpg', 'png']
  }
});

const upload = multer({ storage });

// Create Sheet Music Schema
const sheetMusicSchema = new mongoose.Schema({
  title: String,
  composer: String,
  dateComposed: Date,
  fileUrl: String,
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

const SheetMusic = mongoose.model('SheetMusic', sheetMusicSchema);

// Routes
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const { title, composer, dateComposed } = req.body;
    const fileUrl = req.file.path;

    const sheetMusic = new SheetMusic({
      title,
      composer,
      dateComposed,
      fileUrl,
    });

    await sheetMusic.save();
    res.status(201).json(sheetMusic);
  } catch (error) {
    res.status(500).json({ error: 'Error uploading file' });
  }
});

app.get('/api/sheet-music', async (req, res) => {
  try {
    const { sortBy } = req.query;
    let sortOption = {};

    switch (sortBy) {
      case 'composer':
        sortOption = { composer: 1 };
        break;
      case 'dateComposed':
        sortOption = { dateComposed: 1 };
        break;
      case 'title':
        sortOption = { title: 1 };
        break;
      default:
        sortOption = { uploadDate: -1 };
    }

    const sheetMusic = await SheetMusic.find().sort(sortOption);
    res.json(sheetMusic);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching sheet music' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 