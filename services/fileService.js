const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Ensure upload directories exist
exports.ensureUploadDirectories = async () => {
  const directories = [
    'uploads',
    'uploads/profiles',
    'uploads/documents',
    'uploads/xml',
    'uploads/videos',
    'uploads/books',
    'uploads/temp'
  ];

  for (const dir of directories) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }
};

// Save uploaded file with unique name
exports.saveUploadedFile = async (file, destination) => {
  try {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(destination, fileName);

    // Ensure destination directory exists
    await fs.mkdir(destination, { recursive: true });

    // Move file from temp to destination
    await fs.rename(file.path, filePath);

    return {
      success: true,
      fileName,
      filePath,
      url: `/${filePath.replace(/\\/g, '/')}`
    };

  } catch (error) {
    console.error('Error saving uploaded file:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete file
exports.deleteFile = async (filePath) => {
  try {
    // Remove leading slash if present
    const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;

    await fs.unlink(cleanPath);
    return { success: true };

  } catch (error) {
    console.error('Error deleting file:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete multiple files
exports.deleteMultipleFiles = async (filePaths) => {
  const results = await Promise.allSettled(
    filePaths.map(filePath => this.deleteFile(filePath))
  );
  
  return results.map((result, index) => ({
    file: filePaths[index],
    success: result.status === 'fulfilled',
    error: result.reason?.message
  }));
};

// Get file info
exports.getFileInfo = async (filePath) => {
  try {
    const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    const stats = await fs.stat(cleanPath);

    return {
      success: true,
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
      extension: path.extname(cleanPath)
    };

  } catch (error) {
    console.error('Error getting file info:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Ensure directory exists (alias for compatibility)
exports.ensureDirectory = async (dirPath) => {
  try {
    const fullPath = path.join(__dirname, '..', dirPath);
    await fs.mkdir(fullPath, { recursive: true });
  } catch (error) {
    console.error('Directory creation error:', error);
    throw error;
  }
};

// Clean up old temp files
exports.cleanupTempFiles = async (maxAge = 24 * 60 * 60 * 1000) => {
  try {
    const tempDir = 'uploads/temp';
    const files = await fs.readdir(tempDir);
    const now = Date.now();

    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = await fs.stat(filePath);

      if (now - stats.mtime.getTime() > maxAge) {
        await fs.unlink(filePath);
        deletedCount++;
      }
    }

    console.log(`Cleaned up ${deletedCount} old temp files`);
    return { success: true, deletedCount };

  } catch (error) {
    console.error('Error cleaning up temp files:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Validate file type and size
exports.validateFile = (file, allowedTypes = [], maxSize = 10 * 1024 * 1024) => {
  const errors = [];

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`);
  }

  // Check file type
  if (allowedTypes.length > 0) {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const fileMimeType = file.mimetype.toLowerCase();

    const isAllowed = allowedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExtension === type;
      } else {
        return fileMimeType.includes(type);
      }
    });

    if (!isAllowed) {
      errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// Generate file URL
exports.generateFileUrl = (filePath, baseUrl = process.env.BASE_URL || 'http://localhost:5000') => {
  const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
  return `${baseUrl}${cleanPath}`;
};

// Compress image (if sharp is available)
exports.compressImage = async (inputPath, outputPath, options = {}) => {
  try {
    // This would require sharp package
    // const sharp = require('sharp');
    // await sharp(inputPath)
    //   .resize(options.width, options.height, { fit: 'inside' })
    //   .jpeg({ quality: options.quality || 80 })
    //   .toFile(outputPath);

    // For now, just copy the file
    await fs.copyFile(inputPath, outputPath);

    return {
      success: true,
      outputPath
    };

  } catch (error) {
    console.error('Error compressing image:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Extract text from document (placeholder for future implementation)
exports.extractTextFromDocument = async (filePath) => {
  try {
    // This would require packages like pdf-parse, mammoth, etc.
    // For now, return placeholder
    return {
      success: true,
      text: 'Text extraction not implemented yet',
      wordCount: 0
    };

  } catch (error) {
    console.error('Error extracting text from document:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get storage usage
exports.getStorageUsage = async () => {
  try {
    const uploadDir = 'uploads';
    let totalSize = 0;
    let fileCount = 0;

    async function calculateSize(dirPath) {
      const items = await fs.readdir(dirPath);

      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = await fs.stat(itemPath);

        if (stats.isDirectory()) {
          await calculateSize(itemPath);
        } else {
          totalSize += stats.size;
          fileCount++;
        }
      }
    }

    await calculateSize(uploadDir);

    return {
      success: true,
      totalSize,
      fileCount,
      totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100
    };

  } catch (error) {
    console.error('Error getting storage usage:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Backup files (placeholder for future implementation)
exports.backupFiles = async (destination) => {
  try {
    // This would implement file backup logic
    return {
      success: true,
      message: 'Backup functionality not implemented yet'
    };

  } catch (error) {
    console.error('Error backing up files:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Stream file for download
exports.streamFile = (filePath, res) => {
  try {
    const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;

    if (!fs.existsSync(cleanPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const fileName = path.basename(cleanPath);
    const fileExtension = path.extname(cleanPath).toLowerCase();

    // Set appropriate content type
    const contentTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.mp4': 'video/mp4',
      '.avi': 'video/x-msvideo',
      '.mov': 'video/quicktime'
    };

    const contentType = contentTypes[fileExtension] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    const fileStream = require('fs').createReadStream(cleanPath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error streaming file:', error);
    res.status(500).json({ error: 'Error downloading file' });
  }
};
