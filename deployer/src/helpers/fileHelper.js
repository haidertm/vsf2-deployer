import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import * as rimraf from 'rimraf';

export const ensureDirectory = (dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) {
      console.log(`creatingDirectory>>>>${ dirPath }`)
      fs.mkdirSync(dirPath, { recursive: true });
    } else {
      console.log(`directory>>>>${ dirPath }`)
      console.log(`directory>>>>AlreadyExists`)
    }
    return true;
  } catch (error) {
    console.error(`Error ensuring directory: ${ error }`);
    console.error('Stack Trace:', error.stack);
    return false;
  }
};

export const writeToFile = (filePath, data) => {
  try {
    const dirPath = path.dirname(filePath);
    if (ensureDirectory(dirPath)) {
      fs.writeFileSync(filePath, data);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error writing to file: ${ error }`);
    return false;
  }
};

export const extractTarGz = ({ tarFilePath, targetDirectory, unlink = true }) => {
  return new Promise((resolve, reject) => {
    exec(`tar -xvpzf "${ tarFilePath }" -C "${ targetDirectory }"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error extracting file: ${ error }`);
        reject(error);
        return;
      }
      // console.log(`Extraction successful: ${ stdout }`);
      console.log(`Extraction successful for ${ tarFilePath } to ${ targetDirectory }`);
      if (unlink) {
        fs.unlinkSync(tarFilePath);
      }
      resolve(true);
    });
  });
};

export const updateSymlink = (source, target) => {
  try {
    if (fs.existsSync(target)) {
      console.log(`Unlinking existing symlink at ${ target }`);
      fs.unlinkSync(target);
    } else {
      console.log(`Symlink at ${ target } does not exist`);
    }

    console.log(`Creating new symlink from ${ source } to ${ target }`);
    fs.symlinkSync(source, target);
    console.log(`Successfully created symlink from ${ source } to ${ target }`);
  } catch (error) {
    console.error(`Failed to update symlink from ${ source } to ${ target }`);
    console.error('Error:', error.message);
    console.error('Stack Trace:', error.stack);
    throw error;  // Re-throw the error to be handled by the caller
  }
};

export const deleteOldestRelease = async (releasesDir) => {
  try {
    const dirs = await fs.promises.readdir(releasesDir, { withFileTypes: true });
    const dirStats = await Promise.all(
      dirs.filter((dirent) => dirent.isDirectory()).map(async (dirent) => {
        try {
          const stat = await fs.promises.stat(path.join(releasesDir, dirent.name));
          return { dirent, stat };
        } catch (err) {
          console.error(`Error stat-ing directory: ${ err }`);
          return null;
        }
      })
    );

    const sortedDirs = dirStats.filter(Boolean).sort((a, b) => a.stat.birthtimeMs - b.stat.birthtimeMs);

    // Delete all directories except the latest 3
    if (sortedDirs.length > 3) {
      const dirsToDelete = sortedDirs.slice(0, -3);
      for (const { dirent } of dirsToDelete) {
        try {
          rimraf.sync(path.join(releasesDir, dirent.name));
          console.log(`Successfully deleted directory: ${ dirent.name }`);
        } catch (err) {
          console.error(`Error deleting directory: ${ err }`);
        }
      }
    }
  } catch (error) {
    console.error(`Error deleting the oldest release: ${ error }`);
  }
};

