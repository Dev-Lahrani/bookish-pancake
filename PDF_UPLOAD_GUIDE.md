# 📤 PDF Upload Guide - Complete Instructions

## Quick Answer: Where to Submit PDFs?

**Location**: The PDF upload section is prominently displayed in the **"Plagiarism Checker"** component on the main interface.

### Step-by-Step Instructions

1. **Open the Application**
   - Go to http://localhost:5173
   - You'll see two main sections: "Plagiarism Checker" and "Humanizer"

2. **Find the Upload Area**
   - In the Plagiarism Checker section (left panel)
   - Look for the blue **"Upload PDF"** button or drag-drop zone
   - Alternative: You can also drag and drop PDF files directly onto the interface

3. **Select Your PDF File**
   - Click the upload button
   - Choose a PDF file from your computer
   - File size must be < 50MB
   - Click "Open" to upload

4. **Wait for Processing**
   - System extracts text from PDF (2-5 seconds)
   - Automatically analyzes the text (5-30 seconds)
   - Shows real-time progress indicator

5. **View Results**
   - See plagiarism risk score
   - Get detailed analysis breakdown
   - View extracted text preview
   - Check confidence metrics

6. **Generate Report** *(Optional)*
   - Click "Generate Report" button
   - System creates professional HTML report
   - Export as PDF via browser print (Ctrl+P)

---

## File Upload Details

### Accepted Formats
- ✅ PDF files (.pdf)
- ✅ File size: 1 KB - 50 MB

### File Processing
```
PDF File
    ↓
PDFParser.ts (extract text)
    ↓
Raw Text (sent to analyzer)
    ↓
11-Layer AI Detection
    ↓
Risk Score + Evidence
    ↓
Display Results
```

### Backend Endpoints

**Upload Endpoint**:
```
POST /api/pdf-upload
```

**Request**:
```bash
Content-Type: multipart/form-data

Form Data:
- file: [PDF binary]
```

**Response**:
```json
{
  "success": true,
  "text": "Extracted text from PDF...",
  "fileName": "document.pdf",
  "pages": 5,
  "charCount": 12500,
  "analysis": {
    "aiLikelihood": 65,
    "confidence": 85,
    "details": {...}
  }
}
```

---

## Batch Upload (Advanced)

Upload multiple texts/PDFs at once:

### Using API Directly
```bash
curl -X POST http://localhost:3001/api/batch-analyze \
  -H "Content-Type: application/json" \
  -d '{
    "texts": [
      "First document text...",
      "Second document text...",
      "Third document text..."
    ]
  }'
```

### Using Frontend
1. Click "Batch Analysis" tab
2. Paste multiple texts (separated by |||)
3. Click "Analyze All"
4. See results in grid format

---

## Troubleshooting Upload Issues

### "File too large"
- **Problem**: PDF > 50MB
- **Solution**: Use a smaller PDF or split into multiple files

### "Invalid file format"
- **Problem**: Uploaded non-PDF file
- **Solution**: Only PDF files supported, convert your file to PDF

### "Upload failed"
- **Problem**: Network error or server issue
- **Solution**: 
  - Refresh the page
  - Check backend is running: `npm run dev`
  - Try again

### "Analysis timeout"
- **Problem**: Large PDF taking too long
- **Solution**:
  - Split PDF into smaller files
  - Check internet connection
  - Increase timeout in server settings

### "Model not found error"
- **Problem**: GPT model issue
- **Solution**: Already fixed! Using gpt-4o now
- **Check**: Verify `.env` has valid `OPENAI_API_KEY`

---

## Report Generation After Upload

After successfully analyzing a PDF:

1. **Results are shown immediately**
   - Risk score (0-100%)
   - Confidence level
   - Key evidence

2. **Click "Generate Report"**
   - Creates professional HTML report
   - Includes all metrics and evidence
   - Adds timestamp and report ID

3. **Export Report as PDF**
   - Open the generated HTML report
   - Press Ctrl+P (Windows) or Cmd+P (Mac)
   - Select "Save as PDF"
   - Download professional PDF file

### Report Contains

- **Header**: Title, date, report ID
- **Risk Badge**: Color-coded severity
- **Metrics Card**: 6+ analysis metrics
- **Evidence Section**: Key findings with quotes
- **Suspicious Areas**: Highlighted text sections
- **Recommendations**: Suggestions for improvement
- **Source Preview**: Sample of analyzed text
- **Footer**: Generation timestamp, document ID

---

## API Examples

### Upload & Analyze PDF (Using cURL)
```bash
curl -X POST http://localhost:3001/api/pdf-upload \
  -F "file=@/path/to/document.pdf"
```

### Upload & Analyze PDF (Using Python)
```python
import requests

with open('document.pdf', 'rb') as f:
    files = {'file': f}
    response = requests.post('http://localhost:3001/api/pdf-upload', files=files)
    
print(response.json())
```

### Upload & Analyze PDF (Using JavaScript)
```javascript
const formData = new FormData();
formData.append('file', pdfFile);

const response = await fetch('http://localhost:3001/api/pdf-upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result.analysis);
```

### Upload & Analyze PDF (Using Axios)
```javascript
const formData = new FormData();
formData.append('file', pdfFile);

const response = await axios.post('http://localhost:3001/api/pdf-upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

console.log(response.data.analysis);
```

---

## History & Storage

### View Upload History
1. Click "History" tab in the UI
2. See all previously analyzed documents
3. Click to view past results
4. Delete entries if needed

### Storage Location
- PDFs: Uploaded to `/uploads/` directory
- Reports: Generated to `/reports/` directory
- History: Stored in `/data/history.json`

### Retrieve Previous Analysis
```bash
GET /api/history
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "fileName": "document.pdf",
      "timestamp": "2026-01-12T19:00:00Z",
      "analysis": {...},
      "source": "pdf_upload"
    }
  ]
}
```

---

## Batch Analysis Example

### Analyze Multiple PDFs/Texts
```bash
POST /api/batch-analyze
Content-Type: application/json

{
  "texts": [
    "First text to analyze...",
    "Second text to analyze...",
    "Third text to analyze...",
    "Up to 10 texts at once"
  ]
}
```

**Response**:
```json
{
  "success": true,
  "results": [
    {
      "text": "First text...",
      "analysis": {
        "aiLikelihood": 65,
        "confidence": 85,
        "reasoning": "..."
      }
    },
    {
      "text": "Second text...",
      "analysis": {
        "aiLikelihood": 45,
        "confidence": 90,
        "reasoning": "..."
      }
    }
  ]
}
```

---

## Performance Tips

1. **For Large PDFs**
   - Upload during off-peak times
   - Use smaller documents when possible
   - Enable batch mode for multiple documents

2. **For Faster Analysis**
   - Internet connection required for AI models
   - Anthropic API (if configured) is sometimes faster
   - Fallback to local analysis uses no API

3. **For Better Results**
   - Ensure PDF text is extractable (not scanned images)
   - Use high-quality source documents
   - Check extracted text preview before analysis

---

## Common Questions (FAQ)

**Q: Can I upload images as PDF?**
A: No, scanned PDFs (images) won't work. The text must be selectable/extractable.

**Q: What's the maximum file size?**
A: 50MB. For larger files, split into multiple documents.

**Q: How long does analysis take?**
A: 5-30 seconds depending on document length and API response time.

**Q: Can I analyze password-protected PDFs?**
A: No, the PDF must be unprotected to extract text.

**Q: Where are my uploaded files stored?**
A: Locally in `/uploads/` directory. Files are kept for 24 hours then auto-deleted.

**Q: Can I share a report with others?**
A: Yes, generate the HTML report and send the file. It's self-contained.

**Q: Is my data private?**
A: Yes, all analysis is local. Files aren't sent anywhere except to API providers (OpenAI/Anthropic).

---

## Contact & Support

**Everything working?** → Great! Enjoy the application! 🎉

**Issues?** → Check PROJECT_COMPLETE.md for troubleshooting

**Want more features?** → Refer to AMAZING_FEATURES.md for capabilities

---

**Last Updated**: January 12, 2026
**Status**: ✅ Production Ready
