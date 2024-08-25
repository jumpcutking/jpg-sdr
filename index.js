const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const l = [];

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
 * Log function that also stores the log messages in an array
 * @param {*} item 
 * @param  {...any} obj 
 */
async function lg(item, ...obj) {

    //do I have any objs?
    if (obj.length === 0) {
        console.log(item);
        l.push({
            message: item
        });
        return;
    }

    console.log(item, obj);
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
 * @param {*} path 
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

/**
 * Example usage
 */
async function test() {
    const dir = '/Users/thanos/Documents/clients/Luxe/Footage/20240813 LuxeLevels/Ready for Upload';
    await processDirectory(dir, 3840);
    await archiveHDR(dir);
    save('./log.json');
};

//Commented out so you don't run the example when you import the module
// test();
