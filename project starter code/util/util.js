import fs from "fs";
import Jimp from "jimp";
import https from 'https';
import http from 'http';
import { URL } from 'url'; // Import URL module to parse the input URL

export async function filterImageFromURL(inputURL) {
  return new Promise((resolve, reject) => {
    // Parse the input URL to extract components
    const parsedUrl = new URL(inputURL);

    // Choose the right client based on the protocol
    const client = parsedUrl.protocol === 'https:' ? https : http;

    // Set up options with headers
    const options = {
      protocol: parsedUrl.protocol,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        // Mimic a common browser User-Agent
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
          'AppleWebKit/537.36 (KHTML, like Gecko) ' +
          'Chrome/58.0.3029.110 Safari/537.36',
        'Accept': 'image/*',
      },
    };

    // Make the GET request with headers
    const request = client.request(options, (response) => {
      let imageData = [];

      // Handle HTTP errors
      if (response.statusCode !== 200) {
        reject('Failed to get image. Status code: ' + response.statusCode);
        return;
      }

      // Accumulate the data chunks
      response.on('data', (chunk) => {
        imageData.push(chunk);
      });

      // Once the response is complete
      response.on('end', async () => {
        try {
          // Concatenate all chunks
          const buffer = Buffer.concat(imageData);

          // Read the image from the buffer
          const photo = await Jimp.read(buffer);

          // Generate a random output filename
          const outpath =
            '/tmp/filtered.' + Math.floor(Math.random() * 2000) + '.jpg';

          // Process the image
          await photo
            .resize(256, 256) // Resize
            .quality(60) // Set JPEG quality
            .greyscale() // Set greyscale
            .writeAsync(outpath); // Save the image

          // Resolve with the path to the saved image
          resolve(outpath);
        } catch (error) {
          console.error('Error processing image:', error);
          reject('Could not process the image.');
        }
      });
    });

    // Handle request errors
    request.on('error', (error) => {
      console.error('Error fetching image:', error);
      reject('Could not fetch the image.');
    });

    // End the request
    request.end();
  });
}



// filterImageFromURL
// helper function to download, filter, and save the filtered image locally
// returns the absolute path to the local image
// INPUTS
//    inputURL: string - a publicly accessible url to an image file
// RETURNS
//    an absolute path to a filtered image locally saved file
 export async function OLDfilterImageFromURL(inputURL) {
  return new Promise(async (resolve, reject) => {
    try {
      const photo = await Jimp.read(inputURL);
      const outpath =
        "/tmp/filtered." + Math.floor(Math.random() * 2000) + ".jpg";
      await photo
        .resize(256, 256) // resize
        .quality(60) // set JPEG quality
        .greyscale() // set greyscale
        .write(outpath, (img) => {
          resolve(outpath);
        });
    } catch (error) {
      reject(error);
    }
  });
}

// deleteLocalFiles
// helper function to delete files on the local disk
// useful to cleanup after tasks
// INPUTS
//    files: Array<string> an array of absolute paths to files
 export async function deleteLocalFiles(files) {
  for (let file of files) {
    fs.unlinkSync(file);
  }
}
