import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
// Use memory storage for serverless/cloud environments
const upload = multer({ storage: multer.memoryStorage() });
app.use(cors({
  origin: '*', // Allow all origins (for development)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { userName, description } = req.body;
    const fileBuffer = req.file.buffer; // Use buffer directly from memory
    const fileName = `${Date.now()}-${req.file.originalname}`;

    // Log the mimetype for debugging
    console.log('Uploaded file mimetype:', req.file.mimetype);

    // Upload to Supabase Storage (replace 'audio' with your bucket name)
    const { data, error } = await supabase.storage
      .from('audio')
      .upload(fileName, fileBuffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage.from('audio').getPublicUrl(fileName);

    // Insert metadata into the audio_uploads table
    const { error: insertError } = await supabase
      .from('audio_uploads')
      .insert([
        {
          user_name: userName,
          description,
          file_name: fileName,
          public_url: publicUrlData.publicUrl,
        },
      ]);

    if (insertError) {
      return res.status(500).json({ success: false, error: insertError.message });
    }

    // --- Send webhook to n8n ---
    try {
      await fetch("https://primary-production-4497.up.railway.app/webhook/608478ca-3d85-44f4-8cb6-659a06fe9ba0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName,
          description,
          fileName,
          publicUrl: publicUrlData.publicUrl,
        }),
      });
    } catch (webhookError) {
      // Optionally log or handle webhook errors, but don't fail the upload
      console.error("n8n webhook error:", webhookError);
    }
    // --- End webhook ---

    res.json({
      success: true,
      fileName,
      publicUrl: publicUrlData.publicUrl,
      description,
      userName,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));