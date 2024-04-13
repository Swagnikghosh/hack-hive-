const express = require('express');
const multer = require('multer');
const mysql = require('mysql2');
const path = require('path'); // Add this line to import the path module

const app = express();

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'TUtu22@#',
  database: 'ruraleducation'
});

// Connect
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('MySQL Connected...');
});

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Uploads folder where files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

//console.log("hello");
// Init Upload
const upload = multer({
  storage: storage
}).single('video'); // 'video' is the name attribute of the file input field in your form

// Route for uploading video
// Route for uploading video
app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('Error uploading file:', err);
      return res.status(500).send('Error uploading file.');
    } else {
      // Construct the full path to the uploaded file
      const filePath = path.join(__dirname, 'uploads/', req.file.filename);

      // Insert into MySQL
      
      const { title, description } = req.body;
      const query = `INSERT INTO videos (title, description, filepath) VALUES (?, ?, ?)`;
      db.query(query, [title, description, filePath], (err, result) => {
        if (err) {
          console.error('Error inserting into database:', err);
          return res.status(500).send('Error inserting into database.');
        }
        console.log("success");
        res.send('File uploaded successfully.');
      });
    }
  });
});


// Route for displaying uploaded videos
app.get('/videos', (req, res) => {
  const query = "SELECT * FROM videos";
  db.query(query, (err, results) => {
    if (err) throw err;
    res.render('videos', { videos: results });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
