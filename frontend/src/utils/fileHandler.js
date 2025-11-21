// File Handling Utilities

export const fileHandler = {
  // Maximum file size (in bytes)
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB

  // Allowed file types
  ALLOWED_TYPES: {
    DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    SPREADSHEETS: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    ALL: ['application/pdf', 'image/jpeg', 'image/png']
  },

  // Validate file
  validateFile: (file, maxSize = this.MAX_FILE_SIZE, allowedTypes = this.ALLOWED_TYPES.ALL) => {
    const errors = [];

    if (!file) {
      errors.push('Aucun fichier sélectionné');
      return { isValid: false, errors };
    }

    if (file.size > maxSize) {
      errors.push(`Le fichier dépasse la limite de ${maxSize / 1024 / 1024}MB`);
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push(`Type de fichier non autorisé: ${file.type}`);
    }

    // Check file extension for additional security
    const validExtensions = this.getValidExtensions(allowedTypes);
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      errors.push(`Extension de fichier non autorisée: ${fileExtension}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Get valid file extensions for mime types
  getValidExtensions: (mimeTypes) => {
    const extensionMap = {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    };

    const extensions = [];
    mimeTypes.forEach(mime => {
      if (extensionMap[mime]) {
        extensions.push(...extensionMap[mime]);
      }
    });

    return extensions;
  },

  // Format file size for display
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  },

  // Create FormData from file
  createFormData: (file, fieldName = 'file', additionalData = {}) => {
    const formData = new FormData();
    formData.append(fieldName, file);

    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    return formData;
  },

  // Download file from blob
  downloadFile: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Check if file is image
  isImage: (file) => {
    return file && this.ALLOWED_TYPES.IMAGES.includes(file.type);
  },

  // Check if file is document
  isDocument: (file) => {
    return file && this.ALLOWED_TYPES.DOCUMENTS.includes(file.type);
  }
};

export default fileHandler;
