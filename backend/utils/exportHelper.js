
/**
 * 📊 CSV Export Helper - Secure and reusable
 * Prevents formula injection and handles large datasets
 */

/**
 * Sanitize CSV value to prevent formula injection
 * @param {any} val - Value to sanitize
 * @returns {string} Safe CSV value
 */
const sanitizeCSVValue = (val) => {
  if (val === null || val === undefined) return '';
  
  const strVal = String(val);
  
  // Remove dangerous formula prefixes (=, +, -, @, \t, \r)
  const dangerous = /^[=+\-@\t\r]/;
  const sanitized = dangerous.test(strVal) ? `'${strVal}` : strVal;
  
  // Escape quotes and wrap if contains special chars
  if (sanitized.includes(',') || sanitized.includes('\n') || sanitized.includes('"')) {
    return `"${sanitized.replace(/"/g, '""')}"`;
  }
  
  return sanitized;
};

/**
 * Convert array of objects to CSV string
 * @param {Array<Object>} data - Data to convert
 * @returns {string} CSV string
 */
const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]).map(sanitizeCSVValue).join(',');
  const rows = data.map(row => 
    Object.values(row).map(sanitizeCSVValue).join(',')
  );

  return [headers, ...rows].join('\n');
};

/**
 * Stream CSV data for large datasets (prevents memory issues)
 * @param {Function} dataGenerator - Async generator yielding data chunks
 * @param {Object} res - Express response object
 */
const streamCSV = async (dataGenerator, res) => {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="export-${Date.now()}.csv"`);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');

  let isFirstChunk = true;
  
  for await (const chunk of dataGenerator()) {
    if (isFirstChunk) {
      // Write headers from first chunk
      const headers = Object.keys(chunk[0]).map(sanitizeCSVValue).join(',');
      res.write(headers + '\n');
      isFirstChunk = false;
    }
    
    // Write data rows
    const rows = chunk.map(row => 
      Object.values(row).map(sanitizeCSVValue).join(',')
    ).join('\n');
    res.write(rows + '\n');
  }
  
  res.end();
};

module.exports = {
  sanitizeCSVValue,
  convertToCSV,
  streamCSV
};
