import React, { useState } from "react";
import axios from "axios";

export default function UploadContacts() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a CSV file first.");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://127.0.0.1:8000/upload_contacts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(response.data.message);
    } catch (error) {
      alert("Error uploading file");
    }

    setUploading(false);
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-md">
      <h2 className="text-lg font-semibold">Upload Contacts</h2>
      <input type="file" accept=".csv" onChange={handleFileChange} className="my-2" />
      <button
        onClick={handleUpload}
        className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload Contacts"}
      </button>
    </div>
  );
}
