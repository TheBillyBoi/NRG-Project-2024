import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'https://sheet-music-organizer-api.onrender.com';

function App() {
  const [sheetMusic, setSheetMusic] = useState([]);
  const [sortBy, setSortBy] = useState('uploadDate');
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    composer: '',
    dateComposed: '',
  });

  useEffect(() => {
    fetchSheetMusic();
  }, [sortBy]);

  const fetchSheetMusic = async () => {
    try {
      const response = await fetch(`${API_URL}/api/sheet-music?sortBy=${sortBy}`);
      const data = await response.json();
      setSheetMusic(data);
    } catch (error) {
      console.error('Error fetching sheet music:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append('file', file);
    formDataToSend.append('title', formData.title);
    formDataToSend.append('composer', formData.composer);
    formDataToSend.append('dateComposed', formData.dateComposed);

    try {
      await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formDataToSend,
      });
      
      fetchSheetMusic();
      setFormData({ title: '', composer: '', dateComposed: '' });
      setFile(null);
    } catch (error) {
      console.error('Error uploading sheet music:', error);
    }
  };

  return (
    <div className="App">
      <h1>Sheet Music Organizer</h1>
      
      <form onSubmit={handleSubmit} className="upload-form">
        <input
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Composer"
          value={formData.composer}
          onChange={(e) => setFormData({ ...formData, composer: e.target.value })}
        />
        <input
          type="date"
          value={formData.dateComposed}
          onChange={(e) => setFormData({ ...formData, dateComposed: e.target.value })}
        />
        <input
          type="file"
          accept=".pdf,.jpg,.png"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button type="submit">Upload</button>
      </form>

      <div className="sort-controls">
        <label>Sort by: </label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="uploadDate">Upload Date</option>
          <option value="composer">Composer</option>
          <option value="dateComposed">Date Composed</option>
          <option value="title">Title</option>
        </select>
      </div>

      <div className="sheet-music-list">
        {sheetMusic.map((item) => (
          <div key={item._id} className="sheet-music-item">
            <h3>{item.title}</h3>
            <p>Composer: {item.composer}</p>
            <p>Date Composed: {new Date(item.dateComposed).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App; 