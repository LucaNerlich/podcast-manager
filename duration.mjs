import {parseFile} from 'music-metadata';
import {existsSync, lstatSync, readdirSync} from "node:fs";
import path from "node:path";

/*
windows:
node duration.mjs "C:\Users\lucan\Nextcloud\_media\_DTTD - Supercuts\_supercuts"
 */

// Function to get the MP3 duration for a single file
async function getMp3Duration(filePath) {
  try {
    // Parse the local MP3 file to get its metadata
    const metadata = await parseFile(filePath, {duration: true});
    return metadata.format.duration; // Returns duration in seconds
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return null; // Return null if there's an error
  }
}

// Function to process all MP3 files in a given folder
async function processFolder(folderPath) {
  try {
    // Read all files in the folder
    const files = readdirSync(folderPath);

    // Filter for files with `.mp3` extension
    const mp3Files = files.filter((file) => path.extname(file).toLowerCase() === '.mp3');
    if (mp3Files.length === 0) {
      console.warn('No MP3 files found in the folder.');
      return;
    }

    console.log(`Found ${mp3Files.length} MP3 file(s) in the folder. Processing...\n`);

    // Loop through each MP3 file and get its duration
    for (const file of mp3Files) {
      const filePath = path.join(folderPath, file); // Construct absolute file path
      const duration = await getMp3Duration(filePath); // Get the duration

      if (duration !== null) {
        console.log(`File: ${file}`);
        console.log(`  Duration: ${duration.toFixed(2)} seconds\n`);
      } else {
        console.log(`File: ${file}`);
        console.log(`  Could not determine duration.\n`);
      }
    }
  } catch (error) {
    console.error('Error processing folder:', error.message);
  }
}

// Main script logic
(async () => {
  const folderPath = process.argv[2]; // Accept folder path from command-line arguments

  if (!folderPath) {
    console.error('Please provide a folder path as an argument.');
    console.error('Usage: node script.js /path/to/folder');
    process.exit(1);
  }

  // Check if the folder path exists and is a directory
  if (!existsSync(folderPath) || !lstatSync(folderPath).isDirectory()) {
    console.error('The provided path is not a valid directory.');
    process.exit(1);
  }

  // Process the folder to get MP3 durations
  await processFolder(folderPath);
})();
