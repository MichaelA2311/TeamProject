/**
 * Converts a string into a "slug", which does the following:
 *   - Converts all letters to lower-case
 *   - Removes any non-digit/letter/dash/white space
 *   - Replaces white space with dashes
 *   - Replaces strings of dashes with a single dash
 *
 * @param name - A string, representing the name of a project
 * @returns A sluggified version of the string
 *
 */

export const nameSlug = (name: string): string => {
    return name.toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
};

/**
 * Converts an integer representing a file size in bytes to a string with the closest SI prefix
 * (SI prefix being "kilo", "mega", "giga" and so on, hence "kilobyte", "megabyte"...)
 *
 * @param fileSize: an integer representing the size of a file in bytes
 * @returns A string representing the file with its best fitting SI prefix to two decimal places
 *
 */

export const sizeConversion = (fileSize: number):string => {
    const sizeUnits = ["B", "KB", "MB", "GB", "TB"];
    let i = 0;
    while (fileSize > 1000){
        i++;
        fileSize /= 1000;
    }
    if (i > 4){
        return "very big!";
    }
    return fileSize.toFixed(2) + sizeUnits[i];

};

/**
 * Function to convert Date string to the time since that date
 * 
 * @param last_edited the time to convert
 * @returns a formatted string detailing how long ago `last_edited` was
 */
export const getTimeAgo = (date: string) => {
    const oldDate = new Date(date);
    const now = new Date();
    const timeDifference = now.getTime() - oldDate.getTime();

    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else {
        return 'just now';
    } 
};

/**
 * Function to crop a string to a certain length. Appends '...'
 * 
 * 
 */

export const cropString = (str: string, length: number) => {
    if (str.length <= length) {
        return str;
    } else {
        return str.substring(0, length) + '...';
    }
};


/**
 * Function to convert a number in seconds to a HH:MM:SS string representation
 * 
 * @param seconds the time in seconds
 * @returns a formatted string in the form HH:MM:SS
 */

export const getTime = (seconds : number) => {
    seconds = Math.round(seconds);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};