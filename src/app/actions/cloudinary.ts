'use server'

import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dysfspuz5',
  api_key: process.env.CLOUDINARY_API_KEY || '757499265279951',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'R8PVn1VrFLOvz4OhI26l4FYRPjA',
})

export async function uploadImageToCloudinary(
  fileData: string,
  folder: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const result = await cloudinary.uploader.upload(fileData, {
      folder: folder,
      resource_type: 'auto',
    })

    return {
      success: true,
      url: result.secure_url,
    }
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error)
    return {
      success: false,
      error: 'Failed to upload image',
    }
  }
}

export async function deleteImageFromCloudinary(
  publicId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    })

    return { success: true }
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error)
    return {
      success: false,
      error: 'Failed to delete image',
    }
  }
}
