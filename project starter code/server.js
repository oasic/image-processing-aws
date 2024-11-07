import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util.js';



  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]
app.get("/filteredimage", async (req, res) => {
  // Retrieve image_url parameter and validate
  let image_url = req.query.image_url;

  if (!image_url) {
    // if image_url is not present in the query parameters, return a 400 Bad Request
    return res.status(400).send({ message: 'No image_url parameter provided.' });
  }

  // is image_url a valid URL?
  let url;
  try {
    url = new URL(image_url);
  } catch (_) {
    return res.status(400).send({ message: 'Invalid image at ' + image_url + '. Please try again with a valid URL.' });
  }

  // is image file extension supported by jimp?
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.gif'];

  const pathname = url.pathname.toLowerCase();

  const isSupportedImage = imageExtensions.some(ext => pathname.endsWith(ext));

  if (!isSupportedImage) {
    // If the URL does not end with a known image extension, return a 400 Bad Request
    return res.status(400).send({ message: 'Sorry, we can\'t handle that image type. :(' });
  }

  try {
    // filter the image
    const outPath = await filterImageFromURL(image_url);

    // send file in the response
    res.sendFile(outPath, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send({ message: 'Sorry, but we hand an error processing your image at ' + image_url + '. Please try again later.' });
      } else {
        // delete files
        deleteLocalFiles([outPath]);
      }
    });

  } catch (error) {
    console.error(error);
    res.status(422).send({ message: 'Despite our best efforts, we were unable to process the image at ' + image_url });
  }
});


    /**************************************************************************** */

  //! END @TODO1
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
