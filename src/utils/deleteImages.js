import cloudinary from './cloudinary';

/**
 * Delete a single image from Cloudinary
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise} - Result of the deletion
 */
const deleteImage = async (publicId) => {
  try {
    if (!publicId) {
      throw new Error('Public ID is required');
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    });

    if (result.result === 'ok') {
      return { success: true, message: 'Image deleted successfully' };
    } else {
      throw new Error('Failed to delete image');
    }
  } catch (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param {string[]} publicIds - Array of public IDs to delete
 * @returns {Promise} - Result of the deletion
 */
const deleteMultipleImages = async (publicIds) => {
  try {
    if (!Array.isArray(publicIds) || publicIds.length === 0) {
      throw new Error('Public IDs array is required');
    }

    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: 'image',
    });

    return {
      success: true,
      deleted: result.deleted,
      message: `${Object.keys(result.deleted).length} images deleted successfully`,
    };
  } catch (error) {
    throw new Error(`Failed to delete images: ${error.message}`);
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary image URL
 * @returns {string} - Public ID
 */
const extractPublicId = (url) => {
  try {
    if (!url) {
      throw new Error('URL is required');
    }

    // Extract public ID from Cloudinary URL
    // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/image.jpg
    // Public ID: folder/image
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    
    if (uploadIndex === -1) {
      throw new Error('Invalid Cloudinary URL');
    }

    // Get everything after 'upload' and version (if present)
    let publicIdParts = parts.slice(uploadIndex + 1);
    
    // Remove version if present (starts with 'v' followed by numbers)
    if (publicIdParts[0] && publicIdParts[0].match(/^v\d+$/)) {
      publicIdParts = publicIdParts.slice(1);
    }

    // Join the parts and remove file extension
    const publicId = publicIdParts.join('/').replace(/\.[^/.]+$/, '');
    
    return publicId;
  } catch (error) {
    throw new Error(`Failed to extract public ID: ${error.message}`);
  }
};

/**
 * Delete image by URL
 * @param {string} url - Cloudinary image URL
 * @returns {Promise} - Result of the deletion
 */
const deleteImageByUrl = async (url) => {
  try {
    const publicId = extractPublicId(url);
    return await deleteImage(publicId);
  } catch (error) {
    throw new Error(`Failed to delete image by URL: ${error.message}`);
  }
};

/**
 * Delete multiple images by URLs
 * @param {string[]} urls - Array of Cloudinary image URLs
 * @returns {Promise} - Result of the deletion
 */
const deleteMultipleImagesByUrls = async (urls) => {
  try {
    const publicIds = urls.map(url => extractPublicId(url));
    return await deleteMultipleImages(publicIds);
  } catch (error) {
    throw new Error(`Failed to delete images by URLs: ${error.message}`);
  }
};

export {
  deleteImage,
  deleteMultipleImages,
  extractPublicId,
  deleteImageByUrl,
  deleteMultipleImagesByUrls,
};

export default deleteImage;
