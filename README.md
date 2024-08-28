# jpg-sdr
Converts JPEGS from HDR to SDR.
Built by @jumpcutking.

## Install
Using NPM:
```bash
npm install jpg-sdr
```

## Functions

<dl>
<dt><a href="#findJpgFiles">findJpgFiles(dir, fileList)</a> ⇒</dt>
<dd><p>Finds all JPG files in a directory and its subdirectories.</p>
</dd>
<dt><a href="#convertToSDR">convertToSDR(jpgPath)</a></dt>
<dd><p>Converts an HDR JPG image to an SDR</p>
</dd>
<dt><a href="#lg">lg(item, ...obj)</a></dt>
<dd><p>Log function that also stores the log messages in an array.
Uses Silent mode to not log to the console.</p>
</dd>
<dt><a href="#archiveHDR">archiveHDR(directoryPath)</a></dt>
<dd><p>After converting the HDR image to SDR, we need to archive the HDR image.
We&#39;ll check any jpg file that has a .sdr.jpg file with the same name.
If it does will move it to a folder called &#39;HDR&#39; in the same directory.</p>
</dd>
<dt><a href="#compressFolder">compressFolder(sourceDir, outputFile, excludePatterns)</a></dt>
<dd><p>Compresses a folder into a ZIP archive while excluding certain files and directories.
Example: *.old, *hdr, <em>node_modules</em></p>
</dd>
<dt><a href="#setSilentMode">setSilentMode(silent)</a></dt>
<dd><p>Set the Silent mode to true or false</p>
</dd>
<dt><a href="#test">test()</a></dt>
<dd><p>Example usage</p>
</dd>
</dl>

<a name="findJpgFiles"></a>

## findJpgFiles(dir, fileList) ⇒
Finds all JPG files in a directory and its subdirectories.

**Kind**: global function  
**Returns**: A list of JPG files found in the directory and its subdirectories  

| Param | Type | Description |
| --- | --- | --- |
| dir | <code>\*</code> | The directory to search in. |
| fileList | <code>\*</code> | The list of JPG files found so far. |

<a name="convertToSDR"></a>

## convertToSDR(jpgPath)
Converts an HDR JPG image to an SDR

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| jpgPath | <code>\*</code> | The path to the HDR JPG image |

<a name="lg"></a>

## lg(item, ...obj)
Log function that also stores the log messages in an array.
Uses Silent mode to not log to the console.

**Kind**: global function  

| Param | Type |
| --- | --- |
| item | <code>\*</code> | 
| ...obj | <code>any</code> | 

<a name="archiveHDR"></a>

## archiveHDR(directoryPath)
After converting the HDR image to SDR, we need to archive the HDR image.
We'll check any jpg file that has a .sdr.jpg file with the same name.
If it does will move it to a folder called 'HDR' in the same directory.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| directoryPath | <code>\*</code> | The directory to search in. |

<a name="compressFolder"></a>

## compressFolder(sourceDir, outputFile, excludePatterns)
Compresses a folder into a ZIP archive while excluding certain files and directories.
Example: *.old, *hdr, *node_modules*

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| sourceDir | <code>\*</code> | The source directory to compress. |
| outputFile | <code>\*</code> | The output ZIP file. |
| excludePatterns | <code>\*</code> | An array of patterns to exclude files and directories. |

<a name="setSilentMode"></a>

## setSilentMode(silent)
Set the Silent mode to true or false

**Kind**: global function  

| Param | Type |
| --- | --- |
| silent | <code>boolean</code> | 

<a name="test"></a>

## test()
Example usage

**Kind**: global function  

