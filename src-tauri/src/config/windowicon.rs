//! Windows Shell icon loader.

use std::path::{Path, PathBuf};
use std::sync::Arc;

use moka::sync::Cache;
use image::RgbaImage;
use image::ImageBuffer;
use std::{
    mem::{self, MaybeUninit},
    ptr::addr_of_mut,
};
use image::ImageEncoder;
use image::codecs::png::PngEncoder;
use widestring::{U16CStr, U16CString};
use windows::core::PCWSTR;
use windows::Win32::Storage::FileSystem::FILE_FLAGS_AND_ATTRIBUTES;
use windows::Win32::UI::Controls::IImageList;
use windows::Win32::UI::Shell::{
    SHGetFileInfoW, SHGetImageList, SHFILEINFOW, SHGFI_ICON, SHGFI_LARGEICON, SHIL_JUMBO,SHGFI_SMALLICON,SHIL_SYSSMALL 
};
use windows::Win32::UI::WindowsAndMessaging::{GetIconInfo, HICON, ICONINFO, DestroyIcon};

use windows::Win32::{
    Foundation::HWND,
    Graphics::Gdi::{
        DeleteObject, GetDC, GetDIBits, GetObjectW, ReleaseDC, BITMAP, BITMAPINFOHEADER, BI_RGB,
        DIB_RGB_COLORS, HDC,
    },
};


/// Icon loader implementation for windows shell.
#[derive(Debug)]
pub struct Loader {
    // TODO: don't cache every single file path, instead cache
    // based on file type, handling special paths like home, etc.
    // icon_cache: Cache<PathBuf, Icon>,
}


pub struct Bitmap {
    pub width: u32,
    pub height: u32,
    pub data: Vec<u8>,
}

// pub fn rgba_image_to_base64(image: &RgbaImage) -> Vec<u8> {
//     let (width, height) = image.dimensions();

//         let mut png_data: Vec<u8> = Vec::new();
//         // 이미지 파일로 저장
//          PngEncoder::new(&mut png_data)
//             .write_image(&image,width as u32, height as u32, image::ColorType::Rgba8)
//             .unwrap();
//             png_data
//     // let image_buffer = ImageBuffer::from_raw(width, height, image.pixels().clone()).unwrap();
//     // let image_bytes = image_buffer.to_bytes();
//     // STANDARD.encode(&image_bytes)
// }

pub fn load_winicon(path: &Path) -> Result<Vec<u8>, i32> {
    let path_c = U16CString::from_os_str(path).unwrap();

    unsafe {
        let hicon = get_icon(&path_c);

        let image = icon_to_image(hicon);

        let (width, height) = image.dimensions();

        DestroyIcon(hicon);

        let mut png_data: Vec<u8> = Vec::new();
        // 이미지 파일로 저장
         PngEncoder::new(&mut png_data)
            .write_image(&image,width as u32, height as u32, image::ColorType::Rgba8)
            .unwrap();
    Ok(png_data) 
    }
}

pub fn get_icon(path: &U16CStr) -> HICON {
    let mut shfi = SHFILEINFOW::default();
    let path = PCWSTR::from_raw(path.as_ptr());

    unsafe {
        SHGetFileInfoW(
            path,
            FILE_FLAGS_AND_ATTRIBUTES(0),
            Some(&mut shfi),
            std::mem::size_of::<SHFILEINFOW>() as u32,
            SHGFI_ICON,
        );
    }

    // SHGetFileInfoW only gives us small (32x32) icons, so we access large icons from an image list
    // See https://stackoverflow.com/a/28015423/15842331

    unsafe {
        if let Ok(image_list) = SHGetImageList::<IImageList>(SHIL_JUMBO as i32) {
            if let Ok(large_hicon) = image_list.GetIcon(shfi.iIcon, 0) {
                return large_hicon;
            }
        }
    }

    shfi.hIcon
}

mod hicon {
    use windows::Win32::Graphics::Gdi::{GetBitmapBits, GetObjectW};

    use super::*;

    pub fn convert_to_image(hicon: HICON) -> Vec<u8> {
        unsafe {
            // convert it into a BITMAP first
            let mut icon_info = ICONINFO::default();
            GetIconInfo(hicon, &mut icon_info);

            let mut bitmap = BITMAP::default();
            GetObjectW(
                icon_info.hbmColor,
                std::mem::size_of::<BITMAP>() as i32,
                Some(&mut bitmap as *mut _ as *mut _),
            );

            // extract raw bits
            let size = (bitmap.bmWidthBytes * bitmap.bmHeight) as usize;

            let mut bits = vec![0; size];

            // Thanks! https://users.rust-lang.org/t/how-to-convert-hicon-to-png/90975/15

            GetBitmapBits(icon_info.hbmColor, size as i32, bits.as_mut_ptr() as *mut _);

            bits
            // Some(Bitmap {
            //     width: bitmap.bmWidth as u32,
            //     height: bitmap.bmHeight as u32,
            //     data: bits,
            // })
        }
    }
}

unsafe fn icon_to_image(icon: HICON) -> RgbaImage {
    let bitmap_size_i32 = i32::try_from(mem::size_of::<BITMAP>()).unwrap();
    let biheader_size_u32 = u32::try_from(mem::size_of::<BITMAPINFOHEADER>()).unwrap();

    let mut info = MaybeUninit::uninit();
    GetIconInfo(icon, info.as_mut_ptr()).unwrap();
    let info = info.assume_init_ref();
    DeleteObject(info.hbmMask).unwrap();

    let mut bitmap: MaybeUninit<BITMAP> = MaybeUninit::uninit();
    let result = GetObjectW(
        info.hbmColor,
        bitmap_size_i32,
        Some(bitmap.as_mut_ptr().cast()),
    );
    assert!(result == bitmap_size_i32);
    let bitmap = bitmap.assume_init_ref();

    let width_u32 = u32::try_from(bitmap.bmWidth).unwrap();
    let height_u32 = u32::try_from(bitmap.bmHeight).unwrap();
    let width_usize = usize::try_from(bitmap.bmWidth).unwrap();
    let height_usize = usize::try_from(bitmap.bmHeight).unwrap();
    let buf_size = width_usize
        .checked_mul(height_usize)
        .and_then(|size| size.checked_mul(4))
        .unwrap();
    let mut buf: Vec<u8> = Vec::with_capacity(buf_size);

    let dc = GetDC(HWND(0));
    assert!(dc != HDC(0));

    let mut bitmap_info = BITMAPINFOHEADER {
        biSize: biheader_size_u32,
        biWidth: bitmap.bmWidth,
        biHeight: -bitmap.bmHeight,
        biPlanes: 1,
        biBitCount: 32,
        biCompression: 0,
        biSizeImage: 0,
        biXPelsPerMeter: 0,
        biYPelsPerMeter: 0,
        biClrUsed: 0,
        biClrImportant: 0,
    };
    let result = GetDIBits(
        dc,
        info.hbmColor,
        0,
        height_u32,
        Some(buf.as_mut_ptr().cast()),
        addr_of_mut!(bitmap_info).cast(),
        DIB_RGB_COLORS,
    );
    assert!(result == bitmap.bmHeight);
    buf.set_len(buf.capacity());

    let result = ReleaseDC(HWND(0), dc);
    assert!(result == 1);
    DeleteObject(info.hbmColor).unwrap();

    for chunk in buf.chunks_exact_mut(4) {
        let [b, _, r, _] = chunk else { unreachable!() };
        mem::swap(b, r);
    }

    RgbaImage::from_vec(width_u32, height_u32, buf).unwrap()
}