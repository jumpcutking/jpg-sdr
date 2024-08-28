const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const l = [];
const archiver = require('archiver');

// console.log("this is glob", glob);
// const util = require('util');

// const globPromise = util.promisify(glob);
/**
 * Finds all JPG files in a directory and its subdirectories.
 * @param {*} dir The directory to search in.
 * @param {*} fileList The list of JPG files found so far.
 * @returns A list of JPG files found in the directory and its subdirectories
 */
function findJpgFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            findJpgFiles(filePath, fileList);
        } else if (path.extname(file).toLowerCase() === '.jpg') {
            fileList.push(filePath);
        }
    });

    return fileList;
} module.exports.findJpgFiles = findJpgFiles;

/**
 * Converts an HDR JPG image to an SDR
 * @param {*} jpgPath The path to the HDR JPG image
 */
async function convertToSDR(jpgPath, width = null, height = null) {

    lg(`Converting ${jpgPath} to SDR...`);
    try {
        const outputFilePath = jpgPath.replace(/\.jpg$/i, '.sdr.jpg');
        // Load the image with sharp
        const image = sharp(jpgPath);
    
        // Convert to SDR by normalizing the image
        await image
            .linear(1.0)  // No change to exposure
            .resize(width, height, {
                fit: 'inside',  // Maintain aspect ratio, image fits inside the specified width/height
                withoutEnlargement: true  // Prevent enlarging the image if it's smaller than the specified dimensions
            })
            .toFile(outputFilePath);

    
    } catch (error) {
        lg(`Error:`, error);
    }

   
    lg(`Converted.`);

} module.exports.convertToSDR = convertToSDR;

// Main function to process all JPG files in a directory
async function processDirectory(dir, width = null, height = null) {
    const jpgFiles = findJpgFiles(dir);

    for (const jpgFile of jpgFiles) {
        await convertToSDR(jpgFile, width, height);
    }

    lg('All files have been processed.');
} module.exports.processDirectory = processDirectory;


/**
 * Log function that also stores the log messages in an array.
 * Uses Silent mode to not log to the console.
 * @param {*} item 
 * @param  {...any} obj 
 */
async function lg(item, ...obj) {

    //do I have any objs?
    if (obj.length === 0) {

        if (!(setSilent)) {
            console.log(item);
        }

        l.push({
            message: item
        });
        return;
    }

    if (!(setSilent)) {
        console.log(item, obj);
    }

    // console.log(item, obj);
    l.push({
        message: item,
        obj: obj
    });
}

function save(path) {
    //saves the log messages to a file .json
    fs.writeFileSync(path, JSON.stringify(l, null, 2));
} module.exports.save = save;

/**
 * After converting the HDR image to SDR, we need to archive the HDR image.
 * We'll check any jpg file that has a .sdr.jpg file with the same name.
 * If it does will move it to a folder called 'HDR' in the same directory.
 * @param {*} directoryPath The directory to search in.
 */
async function archiveHDR(directoryPath) {
    lg(`Archiving HDR files in ${directoryPath}...`);

    const files = fs.readdirSync(directoryPath);

    for (const file of files) {
        const filePath = path.join(directoryPath, file);

        try {
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                // Recursively process subdirectories
                await archiveHDR(filePath);
            } else if (path.extname(file).toLowerCase() === '.jpg' && !file.endsWith('.sdr.jpg')) {
                const sdrFilePath = filePath.replace(/\.jpg$/i, '.sdr.jpg');

                if (fs.existsSync(sdrFilePath)) {
                    const hdrFolderPath = path.join(directoryPath, 'HDR');

                    // Create HDR folder if it doesn't exist
                    if (!fs.existsSync(hdrFolderPath)) {
                        fs.mkdirSync(hdrFolderPath);
                    }

                    const newFilePath = path.join(hdrFolderPath, file);

                    // Move the original HDR file to the HDR folder
                    fs.renameSync(filePath, newFilePath);
                    lg(`Moved ${file} to ${hdrFolderPath}`);
                }
            } else {
                lg(`Skipping ${file}`);
            }
        } catch (error) {
            lg(`${file} ERROR:`, error);
        }
    }
} module.exports.archiveHDR = archiveHDR;

// const fs = require('fs');
// const path = require('path');

/**
 * Compresses a folder into a ZIP archive while excluding certain files and directories.
 * Example: *.old, *hdr, *node_modules*
 * @param {*} sourceDir The source directory to compress.
 * @param {*} outputFile The output ZIP file.
 * @param {*} excludePatterns An array of patterns to exclude files and directories.
 */
async function compressFolder(sourceDir, outputFile, excludePatterns) {
    return new Promise((resolve, reject) => {

        lg(`Archiving ${sourceDir} to ${outputFile}...`);

        const output = fs.createWriteStream(outputFile);
        const archive = archiver('zip', {
            zlib: { level: 9 } // Compression level
        });

        output.on('close', () => {
            lg(`Archive created successfully. Total size: ${archive.pointer()} bytes`);
            resolve();
        });

        archive.on('error', (err) => {
            reject(err);
        });

        archive.pipe(output);

        // Recursively traverse the directory
        const traverseDirectory = (dir, parentDir = '') => {
            const items = fs.readdirSync(dir);

            items.forEach((item) => {
                const fullPath = path.join(dir, item);
                const relativePath = path.join(parentDir, item);

                // Check if the item matches any exclusion pattern
                const shouldExclude = excludePatterns.some((pattern) => matchPattern(relativePath, pattern));

                if (!(shouldExclude)) {
                    lg(`Adding ${relativePath}`);
                    if (fs.statSync(fullPath).isDirectory()) {
                        // Recursively add directory
                        traverseDirectory(fullPath, relativePath);
                    } else {
                        // Add file to the archive
                        archive.file(fullPath, { name: relativePath });
                    }
                } else {
                    lg(`Excluding ${relativePath}`);
                }
            });
        };

        // Function to match files and folders with exclusion patterns
        const matchPattern = (filePath, pattern) => {
            const regexPattern = patternToRegex(pattern);
            return regexPattern.test(filePath);
        };

        // Convert a pattern to a regex string
        const patternToRegex = (pattern) => {
            const escapedPattern = pattern.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&'); // Escape special regex chars
            const regexString = escapedPattern.replace(/\*/g, '.*'); // Convert '*' to '.*' regex pattern
            return new RegExp(`^${regexString}$`, 'i'); // Case-insensitive match
        };

        try {
            traverseDirectory(sourceDir);
            archive.finalize();
        } catch (err) {
            reject(err);
        }
    });
} module.exports.compressFolder = compressFolder;

// // Usage example
// (async () => {
//     try {
//         await compressFolder('/path/to/source/folder', '/path/to/output.zip', ['hdr', '*.old']);
//         console.log('Compression completed successfully');
//     } catch (err) {
//         console.error('Error during compression:', err);
//     }
// })();

var setSilent = false;
/**
 * Set the Silent mode to true or false
 * @param {boolean} silent
 */
function setSilentMode(silent) {
    setSilent = silent;
}

/**
 * Example usage
 */
async function test() {
    const dir = 'Ready for Upload';
    // setSilentMode(true);
    await processDirectory(dir, 2080);
    // await processDirectory(dir, 3840);
    await archiveHDR(dir);
    await compressFolder(dir, path.join(dir, '../Ready for Upload.zip'), ['*HDR']);
    save('./log.json');
};

//Commented out so you don't run the example when you import the module
// test();
